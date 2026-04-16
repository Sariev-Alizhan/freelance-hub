-- v13: Freemium helper functions
-- Run in Supabase SQL Editor

-- Count how many order_responses the user submitted this calendar month
CREATE OR REPLACE FUNCTION responses_this_month(uid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM order_responses
  WHERE freelancer_id = uid
    AND created_at >= date_trunc('month', now())
    AND created_at <  date_trunc('month', now()) + interval '1 month';
$$;

-- Count how many orders the user posted this calendar month
CREATE OR REPLACE FUNCTION orders_this_month(uid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM orders
  WHERE client_id  = uid
    AND created_at >= date_trunc('month', now())
    AND created_at <  date_trunc('month', now()) + interval '1 month';
$$;
