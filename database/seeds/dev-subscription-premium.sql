-- =====================================================
-- DEV: Set Demo User to PREMIUM Tier Subscription
-- Use this to test upgrading from Premium to Premium+
-- =====================================================

DO $$
DECLARE
  demo_user_id uuid;
  premium_tier_id uuid;
BEGIN
  -- Get the demo user
  SELECT id INTO demo_user_id FROM users WHERE email = 'thando.bw@test.com';

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user thando.bw@test.com not found.';
  END IF;

  -- Get Premium tier ID
  SELECT id INTO premium_tier_id FROM subscription_tiers WHERE tier_code = 'PREMIUM';

  IF premium_tier_id IS NULL THEN
    RAISE EXCEPTION 'Premium tier not found.';
  END IF;

  -- Update subscription to Premium tier
  UPDATE user_subscriptions
  SET
    tier_id = premium_tier_id,
    status = 'active',
    amount = 180.00,
    updated_at = NOW()
  WHERE user_id = demo_user_id;

  -- If no subscription exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (
      id, user_id, tier_id, status, start_date, end_date,
      next_billing_date, payment_frequency, currency, amount,
      months_unpaid, webinar_credits_remaining, auto_renew, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(), demo_user_id, premium_tier_id, 'active',
      NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days',
      NOW() + INTERVAL '15 days', 'monthly', 'BWP', 180.00,
      0, 2, true, NOW(), NOW()
    );
  END IF;

  RAISE NOTICE 'Demo user subscription set to PREMIUM tier (BWP 180.00/month)';
END $$;

-- Verify
SELECT 'Current Subscription' as info, st.tier_name, us.status, us.amount, us.currency
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
JOIN users u ON us.user_id = u.id
WHERE u.email = 'thando.bw@test.com';
