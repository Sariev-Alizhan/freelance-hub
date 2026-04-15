-- Create private storage bucket for payment receipts
-- Only service_role can read (admin access only, not public)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,   -- private bucket
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Only service_role can upload (our API uses service key)
-- No public read policy — admin views via service key URL
