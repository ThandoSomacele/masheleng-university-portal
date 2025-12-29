# Quick Test Guide
## Masheleng University Portal - Fast Track Testing

This guide provides a streamlined path to test the core user journey in ~30 minutes.

---

## Pre-Test Setup (5 minutes)

### 1. Start Backend
```bash
cd /Users/thando/Documents/masheleng-university-portal
npm run start:dev
```

**Verify:** Backend running on http://localhost:3000

### 2. Verify Database
```bash
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal

# Check sample data exists
SELECT COUNT(*) FROM courses;  -- Should return 3
SELECT COUNT(*) FROM course_lessons;  -- Should return 10
\q
```

### 3. Access Frontend
Open Framer preview or published site URL: ________________

---

## Core User Journey (25 minutes)

### Journey 1: Free User → Entry Subscriber → Course Completion

#### Step 1: Register (2 min)
- [ ] Navigate to `/register`
- [ ] Fill form:
  - Email: `testuser1@example.com`
  - Password: `Test123!`
  - Name: `Test User One`
  - Phone: `+267 71 111 111`
- [ ] Submit → Should see dashboard or pricing

**Quick Check:** User created in database
```sql
SELECT id, email FROM users WHERE email = 'testuser1@example.com';
```

#### Step 2: Subscribe to Entry Tier (3 min)
- [ ] Navigate to `/pricing`
- [ ] Click "Get Started" on **Entry Tier** (BWP 150/month)
- [ ] Verify subscription created → redirected to payment

**Quick Check:** Subscription exists
```sql
SELECT s.id, s.status, pt.name
FROM user_subscriptions s
JOIN pricing_tiers pt ON s.tier_id = pt.id
WHERE s.user_id = '<user-id-from-step-1>';
```

#### Step 3: Make Payment (3 min)
- [ ] Select payment method: **Card**
- [ ] Fill payment form:
  - Card: `4532 1234 5678 9010`
  - Name: `TEST USER`
  - Expiry: `12/25`
  - CVV: `123`
- [ ] Submit payment
- [ ] Note payment ID from success page or database

**Quick Check:** Payment created
```sql
SELECT id, status FROM payments WHERE user_id = '<user-id>' ORDER BY created_at DESC LIMIT 1;
```

#### Step 4: Confirm Payment (Admin Action) (2 min)
```bash
# Get payment ID
PAYMENT_ID="<from-step-3>"

# Get user token (from browser localStorage or login response)
TOKEN="<jwt-token>"

# Confirm payment
curl -X POST http://localhost:3000/api/v1/payments/$PAYMENT_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_reference": "TEST-001"}'
```

**Quick Check:** Payment completed, subscription active
```sql
SELECT p.status as payment_status, s.status as subscription_status
FROM payments p
JOIN user_subscriptions s ON p.subscription_id = s.id
WHERE p.id = '<payment-id>';
-- Should show: payment_status=completed, subscription_status=active
```

#### Step 5: Browse Courses (2 min)
- [ ] Navigate to `/courses` or course catalog
- [ ] Verify all 3 courses visible:
  - ✅ Introduction to TypeScript
  - ✅ Web Development Fundamentals
  - ✅ Business Management Basics (Premium - should show upgrade badge)
- [ ] Click on **Introduction to TypeScript**

#### Step 6: Enroll in Course (2 min)
- [ ] View course details page
- [ ] Expand curriculum to see modules and lessons
- [ ] Click **Enroll Now** button
- [ ] Verify enrollment successful → Button changes to "Continue Learning"

**Quick Check:** Enrollment exists
```sql
SELECT * FROM user_course_enrollments
WHERE user_id = '<user-id>' AND course_id = '11111111-1111-1111-1111-111111111111';
```

#### Step 7: Watch Video Lesson (5 min)
- [ ] Click **Continue Learning** or **Start Course**
- [ ] Course player opens with first lesson: "What is TypeScript?"
- [ ] Click play on Vimeo video
- [ ] Watch for at least 30 seconds
- [ ] Open browser DevTools → Network tab
- [ ] Verify progress API calls every 5 seconds:
  - Look for POST to `/courses/.../lessons/.../progress`

**Quick Check:** Progress being saved
```sql
SELECT watch_time_seconds, last_position_seconds, completion_percentage
FROM user_lesson_progress
WHERE user_id = '<user-id>'
ORDER BY updated_at DESC LIMIT 1;
-- watch_time should increase with each save
```

#### Step 8: Resume Video (2 min)
- [ ] Navigate away from course player (close tab or go to dashboard)
- [ ] Navigate back to course player
- [ ] Verify video resumes from last position (~30 seconds in)

#### Step 9: Complete Lesson & Navigate (3 min)
- [ ] Watch video to completion OR click "Mark as Complete"
- [ ] Verify checkmark appears next to lesson in sidebar
- [ ] Click **Next Lesson** button
- [ ] Verify second lesson loads: "Setting Up Your Development Environment"

**Quick Check:** Lesson marked complete
```sql
SELECT is_completed, completion_percentage
FROM user_lesson_progress
WHERE lesson_id = '11111111-3333-1111-1111-111111111111'  -- First lesson ID
AND user_id = '<user-id>';
-- Should show: is_completed=true, completion_percentage=100
```

#### Step 10: Read Text Lesson (1 min)
- [ ] Navigate to lesson: "Understanding Type Annotations" (lesson 3)
- [ ] Verify text content displays with formatting
- [ ] Check markdown rendering (headers, code blocks)

#### Step 11: Check Dashboard Progress (2 min)
- [ ] Navigate to dashboard
- [ ] Verify course appears in "My Courses"
- [ ] Check progress bar shows correct percentage
  - If 1 of 5 lessons complete: 20%
  - If 2 of 5 lessons complete: 40%

**Quick Check:** Course progress calculated
```sql
SELECT progress_percentage FROM user_course_enrollments
WHERE user_id = '<user-id>' AND course_id = '11111111-1111-1111-1111-111111111111';
```

---

### Journey 2: Payment Methods Testing (10 min)

Create new user or use existing:

#### Bank Transfer Payment
- [ ] Start subscription flow
- [ ] Select **Bank Transfer**
- [ ] Fill bank details:
  - Bank: `First National Bank`
  - Account: `9876543210`
- [ ] Submit → Payment created as pending
- [ ] Verify instructions displayed

#### Mobile Money Payment
- [ ] Select **Mobile Money**
- [ ] Choose provider: `Orange Money`
- [ ] Enter number: `+267 72 222 222`
- [ ] Submit → Payment created as pending
- [ ] Verify mobile instructions shown

#### Manual Payment
- [ ] Select **Manual Payment**
- [ ] Add notes: `Test manual payment`
- [ ] Submit → Payment created as pending
- [ ] Verify campus office instructions shown

**Quick Check:** All payment methods work
```sql
SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;
-- Should show entries for: card, bank_transfer, mobile_money, manual
```

---

## Critical Path Testing Checklist

Use this checklist for quick validation:

- [ ] **User can register** → Database has new user
- [ ] **User can login** → Receives JWT token
- [ ] **User can subscribe** → Subscription created with status=pending
- [ ] **User can make payment** → Payment created with correct amount
- [ ] **Admin can confirm payment** → Payment status=completed, subscription status=active
- [ ] **User can view courses** → All published courses display
- [ ] **User can enroll in course** → Enrollment record created
- [ ] **User can watch video** → Vimeo player loads and plays
- [ ] **Progress auto-saves** → API calls every 5 seconds
- [ ] **Video resumes correctly** → Starts from last position
- [ ] **User can navigate lessons** → Next/Previous work
- [ ] **Completion tracking works** → Lessons marked complete
- [ ] **Course progress calculates** → Percentage updates correctly
- [ ] **Dashboard shows progress** → Courses and progress visible

---

## Quick Debugging Commands

### Check Current User Status
```sql
SELECT
  u.email,
  s.status as subscription_status,
  pt.name as tier,
  COUNT(DISTINCT e.course_id) as enrolled_courses
FROM users u
LEFT JOIN user_subscriptions s ON u.id = s.user_id
LEFT JOIN pricing_tiers pt ON s.tier_id = pt.id
LEFT JOIN user_course_enrollments e ON u.id = e.user_id
WHERE u.email = '<test-email>'
GROUP BY u.id, u.email, s.status, pt.name;
```

### Check User's Learning Progress
```sql
SELECT
  c.title as course,
  e.progress_percentage as course_progress,
  COUNT(DISTINCT lp.lesson_id) as completed_lessons,
  COUNT(DISTINCT l.id) as total_lessons
FROM user_course_enrollments e
JOIN courses c ON e.course_id = c.id
JOIN course_modules m ON c.id = m.course_id
JOIN course_lessons l ON m.id = l.module_id
LEFT JOIN user_lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = e.user_id AND lp.is_completed = true
WHERE e.user_id = (SELECT id FROM users WHERE email = '<test-email>')
GROUP BY c.id, c.title, e.progress_percentage;
```

### Check Payment Status
```sql
SELECT
  p.id,
  p.amount,
  p.payment_method,
  p.status,
  p.created_at,
  s.status as subscription_status
FROM payments p
JOIN user_subscriptions s ON p.subscription_id = s.id
WHERE p.user_id = (SELECT id FROM users WHERE email = '<test-email>')
ORDER BY p.created_at DESC;
```

### Reset User for Re-testing
```sql
-- WARNING: This deletes all user data!
DELETE FROM user_lesson_progress WHERE user_id = (SELECT id FROM users WHERE email = '<test-email>');
DELETE FROM user_course_enrollments WHERE user_id = (SELECT id FROM users WHERE email = '<test-email>');
DELETE FROM payments WHERE user_id = (SELECT id FROM users WHERE email = '<test-email>');
DELETE FROM user_subscriptions WHERE user_id = (SELECT id FROM users WHERE email = '<test-email>');
DELETE FROM users WHERE email = '<test-email>';
```

---

## Expected Test Results

### Success Criteria
✅ User can complete full registration → subscription → payment → enrollment → learning flow
✅ All 4 payment methods create payment records
✅ Video progress saves automatically every 5 seconds
✅ Video resumes from correct position
✅ Course progress calculates correctly
✅ No console errors in browser
✅ No backend errors in terminal

### Known Limitations
⚠️ Payment confirmation requires manual API call (no payment gateway integration yet)
⚠️ Email confirmations not sent (SMTP not configured)
⚠️ Some video IDs may be restricted (Vimeo privacy settings)

---

## Test Data Reference

### Sample Courses
| ID | Title | Tier | Modules | Lessons |
|----|-------|------|---------|---------|
| 11111111-... | Introduction to TypeScript | Entry (1) | 2 | 5 |
| 22222222-... | Web Development Fundamentals | Entry (1) | 2 | 3 |
| 33333333-... | Business Management Basics | Premium (2) | 1 | 2 |

### Vimeo Video IDs Used
- `76979871` - Used in TypeScript course
- `347119375` - Used in Web Dev course
- `391466947` - Used in various lessons

### Test Payment Amounts
- Entry Tier: BWP 150.00
- Premium Tier: BWP 300.00
- Free Tier: BWP 0.00

---

## Quick Issue Resolution

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| 401 Unauthorized | JWT token missing/expired | Login again, copy new token |
| Video won't play | Vimeo privacy restriction | Use different video ID or make video public |
| Progress not saving | Not authenticated | Check Authorization header in network tab |
| Can't enroll | No active subscription | Confirm payment first |
| Payment fails | Subscription not found | Verify subscription ID is correct |

---

## Post-Test Cleanup

```bash
# Stop backend
# Ctrl+C in terminal running npm

# Optionally clear test data
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal

DELETE FROM user_lesson_progress;
DELETE FROM user_course_enrollments;
DELETE FROM payments;
DELETE FROM user_subscriptions;
DELETE FROM users WHERE email LIKE '%@example.com';

\q
```

---

## Next Steps After Testing

If all tests pass:
1. Document any bugs found in GitHub Issues
2. Update `.env` with production values
3. Configure production payment gateway
4. Set up email service (SendGrid/Mailgun)
5. Deploy to staging environment
6. Perform security audit
7. Load testing with multiple concurrent users
8. UAT (User Acceptance Testing) with real users

---

**Estimated Total Test Time:** 30-45 minutes for core flow + payment methods
