-- Fiverr-style fixed-price service packages.
-- A freelancer publishes a service ("I will build you a landing page") with
-- up to 3 tiers (basic / standard / premium). Clients buy a tier and an
-- order is created instantly with the freelancer pre-assigned.

CREATE TABLE IF NOT EXISTS services (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title          text NOT NULL,
  description    text NOT NULL,
  category       text NOT NULL,
  cover_image    text,
  skills         text[] DEFAULT '{}',
  is_active      boolean DEFAULT true,
  purchases_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  CHECK (char_length(title) BETWEEN 10 AND 200),
  CHECK (char_length(description) BETWEEN 40 AND 5000)
);

CREATE INDEX IF NOT EXISTS idx_services_freelancer ON services(freelancer_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_services_category   ON services(category)      WHERE is_active;

CREATE TABLE IF NOT EXISTS service_tiers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id     uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  tier           text NOT NULL CHECK (tier IN ('basic','standard','premium')),
  title          text NOT NULL,
  price          integer NOT NULL CHECK (price > 0),  -- in RUB whole units
  delivery_days  integer NOT NULL CHECK (delivery_days > 0 AND delivery_days <= 365),
  revisions      integer DEFAULT 1 CHECK (revisions >= -1),  -- -1 = unlimited
  description    text,
  features       text[] DEFAULT '{}',
  UNIQUE(service_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_service_tiers_service ON service_tiers(service_id);

-- Link an order back to the service/tier it came from, so we can show
-- "Bought via Basic package — Landing page service" on the order detail.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS service_id      uuid REFERENCES services(id)      ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_tier_id uuid REFERENCES service_tiers(id) ON DELETE SET NULL;

ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_read"       ON services      FOR SELECT USING (true);
CREATE POLICY "services_owner_all"  ON services      FOR ALL
  USING (auth.uid() = freelancer_id) WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "service_tiers_read"  ON service_tiers FOR SELECT USING (true);
CREATE POLICY "service_tiers_owner" ON service_tiers FOR ALL
  USING (EXISTS (SELECT 1 FROM services s WHERE s.id = service_tiers.service_id AND s.freelancer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM services s WHERE s.id = service_tiers.service_id AND s.freelancer_id = auth.uid()));
