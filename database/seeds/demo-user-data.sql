-- =====================================================
-- Demo User Data for thando.bw@test.com
-- Creates subscription, payment, and insurance for demo purposes
-- =====================================================

-- First, get the user ID and tier IDs
DO $$
DECLARE
  demo_user_id uuid;
  premium_plus_tier_id uuid;
  new_subscription_id uuid;
  new_payment_id uuid;
BEGIN
  -- Get the demo user
  SELECT id INTO demo_user_id FROM users WHERE email = 'thando.bw@test.com';

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user thando.bw@test.com not found. Please create the user first.';
  END IF;

  -- Get Premium+ tier ID
  SELECT id INTO premium_plus_tier_id FROM subscription_tiers WHERE tier_code = 'PREMIUM_PLUS';

  IF premium_plus_tier_id IS NULL THEN
    RAISE EXCEPTION 'Premium+ tier not found. Please run migrations first.';
  END IF;

  -- Delete existing demo data for this user (for re-running)
  DELETE FROM insurance_policies WHERE user_id = demo_user_id;
  DELETE FROM payments WHERE user_id = demo_user_id;
  DELETE FROM user_subscriptions WHERE user_id = demo_user_id;

  -- Generate UUIDs for new records
  new_subscription_id := uuid_generate_v4();
  new_payment_id := uuid_generate_v4();

  -- =====================================================
  -- Create Active Premium+ Subscription
  -- =====================================================
  INSERT INTO user_subscriptions (
    id,
    user_id,
    tier_id,
    status,
    start_date,
    end_date,
    next_billing_date,
    payment_frequency,
    currency,
    amount,
    months_unpaid,
    webinar_credits_remaining,
    auto_renew,
    created_at,
    updated_at
  ) VALUES (
    new_subscription_id,
    demo_user_id,
    premium_plus_tier_id,
    'active',
    NOW() - INTERVAL '15 days',  -- Started 15 days ago
    NOW() + INTERVAL '15 days',  -- Ends in 15 days
    NOW() + INTERVAL '15 days',  -- Next billing in 15 days
    'monthly',
    'BWP',
    250.00,
    0,
    4,  -- 4 webinar credits
    true,
    NOW() - INTERVAL '15 days',
    NOW()
  );

  RAISE NOTICE 'Created subscription: %', new_subscription_id;

  -- =====================================================
  -- Create Completed Payment for Subscription
  -- =====================================================
  INSERT INTO payments (
    id,
    user_id,
    subscription_id,
    amount,
    currency,
    status,
    payment_method,
    payment_reference,
    external_transaction_id,
    payment_details,
    paid_at,
    notes,
    created_at,
    updated_at
  ) VALUES (
    new_payment_id,
    demo_user_id,
    new_subscription_id,
    250.00,
    'BWP',
    'completed',
    'card',
    'DEMO-PAY-' || TO_CHAR(NOW(), 'YYYYMMDD'),
    'txn_demo_' || REPLACE(new_payment_id::text, '-', ''),
    '{"card_last_four": "4242", "card_brand": "Visa", "demo": true}',
    NOW() - INTERVAL '15 days',
    'Demo payment for testing purposes',
    NOW() - INTERVAL '15 days',
    NOW()
  );

  RAISE NOTICE 'Created payment: %', new_payment_id;

  -- =====================================================
  -- Create Active Insurance Policy (Funeral Cover)
  -- NOTE: Ignoring location check for demo purposes
  -- =====================================================
  INSERT INTO insurance_policies (
    id,
    user_id,
    type,
    policy_number,
    status,
    premium,
    coverage_amount,
    start_date,
    end_date,
    beneficiaries,
    medical_info,
    underwriter_data,
    notes,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    demo_user_id,
    'life',  -- Using 'life' as the type for funeral cover
    'MU-INS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    'active',
    0.00,  -- Free with Premium+ subscription
    50000.00,  -- P50,000 funeral cover
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    '[
      {"name": "Lerato Mokoena", "relationship": "Spouse", "percentage": 50},
      {"name": "Kgosi Mokoena", "relationship": "Child", "percentage": 25},
      {"name": "Naledi Mokoena", "relationship": "Child", "percentage": 25}
    ]'::jsonb,
    '{"hasPreExistingConditions": false}'::jsonb,
    jsonb_build_object('underwriterId', 'DEMO', 'riskScore', 1, 'notes', 'Demo policy for testing', 'approvedBy', 'System', 'approvedAt', NOW()::text),
    'Demo insurance policy activated for testing purposes. Location check bypassed.',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created insurance policy for user: %', demo_user_id;

  -- =====================================================
  -- Enroll User in All Available Courses
  -- =====================================================
  DELETE FROM user_course_enrollments WHERE user_id = demo_user_id;

  -- Enroll in all published courses
  INSERT INTO user_course_enrollments (
    id,
    user_id,
    course_id,
    status,
    progress_percentage,
    last_accessed_at,
    enrolled_at,
    updated_at
  )
  SELECT
    uuid_generate_v4(),
    demo_user_id,
    c.id,
    'active',
    CASE
      WHEN ROW_NUMBER() OVER (ORDER BY c.sort_order) = 1 THEN 35  -- First course: 35% progress
      WHEN ROW_NUMBER() OVER (ORDER BY c.sort_order) = 2 THEN 10  -- Second course: 10% progress
      ELSE 0  -- Other courses: not started
    END,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '10 days',
    NOW()
  FROM courses c
  WHERE c.status = 'published';

  RAISE NOTICE 'Enrolled user in all available courses';
  RAISE NOTICE 'Demo data setup complete!';

END $$;

-- =====================================================
-- Verify the data was created
-- =====================================================
SELECT 'Subscription' as type, us.id, us.status, st.tier_name, us.amount, us.currency
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id
JOIN users u ON us.user_id = u.id
WHERE u.email = 'thando.bw@test.com';

SELECT 'Payment' as type, p.id, p.status, p.amount, p.currency, p.payment_method
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'thando.bw@test.com';

SELECT 'Insurance' as type, ip.id, ip.status, ip.coverage_amount, ip.type, ip.policy_number
FROM insurance_policies ip
JOIN users u ON ip.user_id = u.id
WHERE u.email = 'thando.bw@test.com';

SELECT 'Enrollments' as type, uce.id, c.title as course_name, uce.status, uce.progress_percentage
FROM user_course_enrollments uce
JOIN courses c ON uce.course_id = c.id
JOIN users u ON uce.user_id = u.id
WHERE u.email = 'thando.bw@test.com';
