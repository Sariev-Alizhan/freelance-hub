-- v9: Admin RBAC via Supabase Claims
-- Run this in the Supabase SQL editor

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Function: sync is_admin → auth.users raw_app_meta_data
--    Called on every login and whenever profiles.is_admin changes.
CREATE OR REPLACE FUNCTION public.sync_admin_claim()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{is_admin}',
      to_jsonb(NEW.is_admin)
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 3. Trigger: fire whenever is_admin changes on profiles
DROP TRIGGER IF EXISTS trg_sync_admin_claim ON public.profiles;
CREATE TRIGGER trg_sync_admin_claim
  AFTER INSERT OR UPDATE OF is_admin ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_admin_claim();

-- 4. Promote the platform owner to admin (replace with real user id or email)
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'raimzhan1907@gmail.com');
