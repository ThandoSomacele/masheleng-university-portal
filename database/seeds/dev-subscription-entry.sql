-- =====================================================
-- DEV: Set Demo User to ENTRY Tier Subscription
-- Use this to test upgrading from Entry to Premium/Premium+
-- =====================================================

DO $$
DECLARE
  demo_user_id uuid;
  entry_tier_id uuid;
BEGIN
  -- Get the demo user
  SELECT id INTO demo_user_id FROM users WHERE email = 'thando.bw@test.com';

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user thando.bw@test.com not found.';
  END IF;

  -- Get Entry tier ID
  SELECT id INTO entry_tier_id FROM subscription_tiers WHERE tier_code = 'ENTRY';

  IF entry_tier_id IS NULL THEN
    RAISE EXCEPTION 'Entry tier not found.';
  END IF;

  -- Update subscription to Entry tier
  UPDATE user_subscriptions
  SET
    tier_id = entry_tier_id,
    status = 'active',
    amount = 99.00,
    updated_at = NOW()
  WHERE user_id = demo_user_id;

  -- If no subscription exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (
      id, user_id, tier_id, status, start_date, end_date,
      next_billing_date, payment_frequency, currency, amount,
      months_unpaid, webinar_credits_remaining, auto_renew, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(), demo_user_id, entry_tier_id, 'active',
      NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days',
      NOW() + INTERVAL '15 days', 'monthly', 'BWP', 99.00,
      0, 0, true, NOW(), NOW()
    );
  END IF;

  RAISE NOTICE 'Demo user subscription set to ENTRY tier (BWP 99.00/month)';
END $$;

-- Verify
SELECT 'Current Subscription' as info, st.tier_name, us.status, us.amount, us.currency
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
JOIN users u ON us.user_id = u.id
WHERE u.email = 'thando.bw@test.com';
