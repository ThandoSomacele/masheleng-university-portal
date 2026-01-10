-- =====================================================
-- DEV: Remove Demo User Subscription
-- Use this to test the full subscription flow from scratch
-- =====================================================

DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Get the demo user
  SELECT id INTO demo_user_id FROM users WHERE email = 'thando.bw@test.com';

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user thando.bw@test.com not found.';
  END IF;

  -- Delete subscription (but keep enrollments and other data)
  DELETE FROM user_subscriptions WHERE user_id = demo_user_id;

  RAISE NOTICE 'Demo user subscription removed - user now has NO subscription';
END $$;

-- Verify
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN 'No subscription - ready to test subscription flow'
    ELSE 'Subscription still exists'
  END as status
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'thando.bw@test.com';
