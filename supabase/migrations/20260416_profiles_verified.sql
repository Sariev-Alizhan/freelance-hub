-- Denormalize is_verified onto profiles so feed/messages queries can read it without a join
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Sync existing verified freelancers
UPDATE profiles p
SET    is_verified = true
FROM   freelancer_profiles fp
WHERE  fp.user_id = p.id
  AND  fp.is_verified = true;
