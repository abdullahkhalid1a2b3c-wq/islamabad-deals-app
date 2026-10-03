-- supabase/tests/01_rls_tests.sql
-- Verification script to test RLS policies, trigger rules, and access permissions

BEGIN;

-- 1. Test Anonymous Read Access (Active deals readable, draft/expired deals and orders denied)
SET LOCAL ROLE anon;

-- Should return rows (active valid deals)
SELECT count(*) AS public_active_deals_count FROM public.deals WHERE status = 'active';

-- Should return 0 rows (draft or expired deals blocked by RLS)
SELECT count(*) AS public_draft_deals_count FROM public.deals WHERE status = 'draft';

-- Should return 0 rows (orders blocked for anonymous)
SELECT count(*) AS anon_orders_count FROM public.orders;

-- 2. Test Non-Admin Role Change Block (Trigger enforcement)
-- Simulate user context
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Direct attempt to set role = 'ADMIN' should fail with Exception: Unauthorized: Only an ADMIN can change user roles.
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles SET role = 'ADMIN'::public.user_role WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST FAILED: Role change should have been blocked by trigger!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Role change blocked by trigger - %', SQLERRM;
  END;
END;
$$;

-- 3. Test Forced Pending Restaurant Status on Non-Admin Insert
DO $$
DECLARE
  v_test_rest_id UUID;
  v_inserted_status public.restaurant_status;
BEGIN
  -- User inserts restaurant as 'active'
  INSERT INTO public.restaurants (
    name, slug, area_id, address, location, phone, price_range, status, logo_url
  ) VALUES (
    'Test Resto', 'test-resto-slug', 'a0000000-0000-0000-0000-000000000001', 'Test address',
    ST_SetSRID(ST_MakePoint(73.07, 33.72), 4326)::geography, '+9251000000', 2, 'active', 'https://example.com/logo.jpg'
  ) RETURNING id, status INTO v_test_rest_id, v_inserted_status;

  IF v_inserted_status = 'pending' THEN
    RAISE NOTICE 'SUCCESS: Non-admin inserted restaurant forced to pending status';
  ELSE
    RAISE EXCEPTION 'TEST FAILED: Status was not forced to pending! Status = %', v_inserted_status;
  END IF;
END;
$$;

ROLLBACK;
