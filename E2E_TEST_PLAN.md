# End-to-End Test Plan
## Masheleng University Portal

**Test Date:** _____________
**Tester:** _____________
**Environment:** Production/Staging/Local
**Backend URL:** https://84816946c72d.ngrok-free.app/api/v1
**Frontend URL:** _____________

---

## Test Overview

This document provides a comprehensive test plan for the complete user journey through the Masheleng University Portal, from registration to course completion.

### Test Objectives
- Verify complete user registration and authentication flow
- Test subscription and payment processing for all methods
- Validate course browsing, enrollment, and viewing functionality
- Confirm video playback and progress tracking
- Test insurance activation feature
- Verify dashboard functionality and user stats

---

## Pre-Test Setup

### Database Preparation
- [ ] Confirm database is running: `psql -h localhost -U masheleng -d masheleng_portal`
- [ ] Verify sample data exists: `SELECT COUNT(*) FROM courses;` (should return 3)
- [ ] Check pricing tiers exist: `SELECT * FROM pricing_tiers;`
- [ ] Backup database (optional): `pg_dump masheleng_portal > backup.sql`

### Backend Verification
- [ ] Backend is running on port 3000
- [ ] API health check: `curl http://localhost:3000/api/v1/auth/health` or similar
- [ ] Check environment variables are set (`.env.development`)

### Frontend Verification
- [ ] Framer site is published and accessible
- [ ] All components are properly integrated
- [ ] API_URL in components points to correct backend

---

## Test Scenarios

## 1. User Registration & Authentication

### 1.1 Register New User
**Component:** `RegisterForm.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1.1.1 | Navigate to registration page | Registration form displays | ☐ | |
| 1.1.2 | Enter email: `test@example.com` | Email field accepts input | ☐ | |
| 1.1.3 | Enter password: `Test123!` | Password field masked | ☐ | |
| 1.1.4 | Enter full name: `Test User` | Name field accepts input | ☐ | |
| 1.1.5 | Enter phone: `+267 71 234 567` | Phone field accepts input | ☐ | |
| 1.1.6 | Click "Register" | User created successfully | ☐ | |
| 1.1.7 | Check response | JWT token received | ☐ | |
| 1.1.8 | Verify redirect | Redirected to pricing/dashboard | ☐ | |

**API Endpoint:** `POST /auth/register`

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "full_name": "Test User",
  "phone_number": "+267 71 234 567"
}
```

**Validation Tests:**
- [ ] Duplicate email shows error
- [ ] Weak password shows error
- [ ] Missing required fields shows error
- [ ] Invalid email format shows error

---

### 1.2 User Login
**Component:** `LoginForm.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 1.2.1 | Navigate to login page | Login form displays | ☐ | |
| 1.2.2 | Enter email: `test@example.com` | Email field accepts input | ☐ | |
| 1.2.3 | Enter password: `Test123!` | Password field masked | ☐ | |
| 1.2.4 | Click "Login" | User authenticated successfully | ☐ | |
| 1.2.5 | Check response | JWT token received | ☐ | |
| 1.2.6 | Verify redirect | Redirected to dashboard | ☐ | |

**Validation Tests:**
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Empty fields show validation errors

---

## 2. Subscription & Payment Flow

### 2.1 View Pricing Tiers
**Component:** `PricingTiers.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.1.1 | Navigate to pricing page | All tiers display (Free, Entry, Premium) | ☐ | |
| 2.1.2 | Check Free tier | Shows BWP 0/month, basic features | ☐ | |
| 2.1.3 | Check Entry tier | Shows BWP 150/month, "Popular" badge | ☐ | |
| 2.1.4 | Check Premium tier | Shows BWP 300/month, all features | ☐ | |
| 2.1.5 | Verify features list | Each tier shows correct features | ☐ | |

---

### 2.2 Subscribe to Entry Tier

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.2.1 | Click "Get Started" on Entry tier | Subscription created | ☐ | |
| 2.2.2 | Verify subscription status | Status is "pending" | ☐ | |
| 2.2.3 | Check redirect | Redirected to payment page | ☐ | |

**API Endpoint:** `POST /subscriptions`
**Expected Response:** Subscription with `status: "pending"`

---

### 2.3 Payment Flow - Card Payment
**Components:** `PaymentWorkflow.tsx`, `PaymentMethodSelector.tsx`, `PaymentForm.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.3.1 | View payment method selector | 4 methods display | ☐ | |
| 2.3.2 | Select "Credit/Debit Card" | Card is highlighted | ☐ | |
| 2.3.3 | Click "Continue to Payment" | Payment form displays | ☐ | |
| 2.3.4 | Enter card number: `4532 1234 5678 9010` | Number formatted correctly | ☐ | |
| 2.3.5 | Enter name: `TEST USER` | Name in uppercase | ☐ | |
| 2.3.6 | Enter expiry: `12/25` | Formatted as MM/YY | ☐ | |
| 2.3.7 | Enter CVV: `123` | CVV masked | ☐ | |
| 2.3.8 | Click "Pay BWP 150.00" | Payment processing | ☐ | |
| 2.3.9 | Check payment status | Payment created with status "pending" | ☐ | |
| 2.3.10 | Verify payment record | Payment saved in database | ☐ | |

**API Endpoint:** `POST /payments`

**Test Data:**
```json
{
  "subscription_id": "<from-step-2.2>",
  "amount": 150.00,
  "currency": "BWP",
  "payment_method": "card",
  "notes": "Card payment: TEST USER - 9010"
}
```

---

### 2.4 Payment Flow - Bank Transfer

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.4.1 | Select "Bank Transfer" | Bank method highlighted | ☐ | |
| 2.4.2 | Click "Continue to Payment" | Bank transfer form displays | ☐ | |
| 2.4.3 | Enter bank name: `First National Bank` | Bank name accepted | ☐ | |
| 2.4.4 | Enter account: `1234567890` | Account number accepted | ☐ | |
| 2.4.5 | View instructions | Transfer instructions displayed | ☐ | |
| 2.4.6 | Submit payment | Payment created as "pending" | ☐ | |

---

### 2.5 Payment Flow - Mobile Money

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.5.1 | Select "Mobile Money" | Mobile money highlighted | ☐ | |
| 2.5.2 | Click "Continue to Payment" | Mobile money form displays | ☐ | |
| 2.5.3 | Select provider: `Orange Money` | Provider selected from dropdown | ☐ | |
| 2.5.4 | Enter number: `+267 71 234 567` | Phone number accepted | ☐ | |
| 2.5.5 | View instructions | Mobile money steps displayed | ☐ | |
| 2.5.6 | Submit payment | Payment created as "pending" | ☐ | |

---

### 2.6 Payment Flow - Manual Payment

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.6.1 | Select "Manual Payment" | Manual method highlighted | ☐ | |
| 2.6.2 | Click "Continue to Payment" | Manual payment form displays | ☐ | |
| 2.6.3 | View instructions | Campus office instructions shown | ☐ | |
| 2.6.4 | Add notes (optional) | Notes field accepts input | ☐ | |
| 2.6.5 | Submit payment | Payment created as "pending" | ☐ | |

---

### 2.7 Payment Success Flow
**Component:** `PaymentSuccess.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.7.1 | Complete payment | Success page displays | ☐ | |
| 2.7.2 | Check success icon | Green checkmark animation | ☐ | |
| 2.7.3 | Verify amount | Correct amount displayed | ☐ | |
| 2.7.4 | Check transaction ID | Payment ID shown | ☐ | |
| 2.7.5 | Verify email notice | Confirmation email notice shown | ☐ | |
| 2.7.6 | Click "Continue to Dashboard" | Redirects to dashboard | ☐ | |

---

### 2.8 Payment Failed Flow
**Component:** `PaymentFailed.tsx`

**Note:** To test this, you can manually trigger errors or use invalid payment data.

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.8.1 | Trigger payment error | Error page displays | ☐ | |
| 2.8.2 | Check error icon | Red X icon shown | ☐ | |
| 2.8.3 | View error message | Specific error displayed | ☐ | |
| 2.8.4 | Check suggestions | Contextual tips shown | ☐ | |
| 2.8.5 | Click "Try Again" | Returns to method selection | ☐ | |
| 2.8.6 | Click "Change Payment Method" | Returns to method selection | ☐ | |
| 2.8.7 | Click "Contact Support" | Opens email client | ☐ | |

---

### 2.9 Confirm Payment (Admin/Manual)

**API Test:** Use curl or Postman to confirm pending payment

```bash
# Get payment ID from database
psql -h localhost -U masheleng -d masheleng_portal -c \
  "SELECT id FROM payments WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1;"

# Confirm payment (replace <payment-id> and <token>)
curl -X POST http://localhost:3000/api/v1/payments/<payment-id>/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"payment_reference": "TEST-REF-001"}'
```

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 2.9.1 | Confirm payment via API | Payment status → "completed" | ☐ | |
| 2.9.2 | Check subscription | Subscription status → "active" | ☐ | |
| 2.9.3 | Verify paid_at | Timestamp set | ☐ | |

**Database Verification:**
```sql
-- Check payment status
SELECT id, status, paid_at FROM payments WHERE user_id = '<user-id>';

-- Check subscription status
SELECT id, status, tier_id FROM user_subscriptions WHERE user_id = '<user-id>';
```

---

## 3. Course Browsing & Discovery

### 3.1 View Course Catalog
**Component:** `CourseCatalog.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 3.1.1 | Navigate to courses page | All 3 courses display | ☐ | |
| 3.1.2 | Check TypeScript course | Thumbnail, title, description shown | ☐ | |
| 3.1.3 | Check Web Dev course | All details visible | ☐ | |
| 3.1.4 | Check Business course | Tier requirement badge shown | ☐ | |
| 3.1.5 | Verify course stats | Duration, lessons count shown | ☐ | |

**API Endpoint:** `GET /courses`

**Expected Response:** Array of 3 courses
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Introduction to TypeScript",
    "required_tier_level": 1,
    "status": "published"
  }
  // ... 2 more courses
]
```

---

### 3.2 Filter Courses

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 3.2.1 | Select "Beginner" level filter | Only beginner courses shown | ☐ | |
| 3.2.2 | Select tier filter "Entry" | Entry-accessible courses shown | ☐ | |
| 3.2.3 | Search "TypeScript" | TypeScript course appears | ☐ | |
| 3.2.4 | Clear all filters | All courses shown again | ☐ | |

---

## 4. Course Detail & Enrollment

### 4.1 View Course Details
**Component:** `CourseDetail.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 4.1.1 | Click on TypeScript course | Course detail page opens | ☐ | |
| 4.1.2 | View course header | Thumbnail, title, description shown | ☐ | |
| 4.1.3 | Check course stats | Lessons, duration, level shown | ☐ | |
| 4.1.4 | View curriculum | All modules displayed | ☐ | |
| 4.1.5 | Expand module 1 | Lessons list appears | ☐ | |
| 4.1.6 | Check lesson icons | Video/text icons shown correctly | ☐ | |
| 4.1.7 | View preview lessons | Preview badge shown | ☐ | |

**API Endpoint:** `GET /courses/{courseId}/curriculum`

**Expected Response:**
```json
{
  "modules": [
    {
      "id": "...",
      "title": "Getting Started with TypeScript",
      "lessons": [
        {
          "id": "...",
          "title": "What is TypeScript?",
          "lesson_type": "video",
          "is_preview": true
        }
      ]
    }
  ]
}
```

---

### 4.2 Enroll in Course

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 4.2.1 | Click "Enroll Now" button | Enrollment processing | ☐ | |
| 4.2.2 | Check enrollment status | Status is "active" | ☐ | |
| 4.2.3 | Verify button changes | Button shows "Continue Learning" | ☐ | |
| 4.2.4 | Check progress indicator | 0% progress shown | ☐ | |

**API Endpoint:** `POST /courses/{courseId}/enroll`

**Database Verification:**
```sql
SELECT * FROM user_course_enrollments
WHERE user_id = '<user-id>' AND course_id = '<course-id>';
```

---

### 4.3 Tier Restriction Check

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 4.3.1 | View Business course (Premium tier) | Upgrade prompt shown | ☐ | |
| 4.3.2 | Try to enroll | Error message or redirect | ☐ | |
| 4.3.3 | Check enrollment button | Disabled or shows "Upgrade Required" | ☐ | |

---

## 5. Course Viewing & Progress Tracking

### 5.1 Access Course Player
**Component:** `CoursePlayer.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.1.1 | Click "Continue Learning" | Course player opens | ☐ | |
| 5.1.2 | Check layout | Sidebar + content area visible | ☐ | |
| 5.1.3 | View curriculum sidebar | All lessons listed | ☐ | |
| 5.1.4 | Check progress bar | Course progress shown at top | ☐ | |
| 5.1.5 | Verify current lesson | First lesson highlighted | ☐ | |

---

### 5.2 Watch Video Lesson
**Component:** `VimeoPlayer.tsx`

**Test Lesson:** "What is TypeScript?" (Video ID: 76979871)

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.2.1 | Lesson loads | Vimeo player displays | ☐ | |
| 5.2.2 | Click play | Video plays successfully | ☐ | |
| 5.2.3 | Check video controls | Play, pause, volume work | ☐ | |
| 5.2.4 | Watch for 30 seconds | Video continues playing | ☐ | |
| 5.2.5 | Pause video | Video pauses | ☐ | |
| 5.2.6 | Check progress tracking | Progress saved (check network tab) | ☐ | |

**API Endpoint:** `POST /courses/{courseId}/lessons/{lessonId}/progress`

**Expected API Calls:** Every 5 seconds while playing

**Request Body:**
```json
{
  "watch_time_seconds": 30,
  "last_position_seconds": 30,
  "completion_percentage": 43
}
```

---

### 5.3 Progress Auto-Save

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.3.1 | Watch video for 60 seconds | Progress API called 12 times | ☐ | |
| 5.3.2 | Check browser network tab | POST requests to /progress | ☐ | |
| 5.3.3 | Verify database | watch_time_seconds updated | ☐ | |
| 5.3.4 | Check completion_percentage | Percentage calculated correctly | ☐ | |

**Database Verification:**
```sql
SELECT * FROM user_lesson_progress
WHERE user_id = '<user-id>' AND lesson_id = '<lesson-id>';
```

**Expected Data:**
- `watch_time_seconds`: ~60
- `last_position_seconds`: ~60
- `completion_percentage`: ~86 (for 7-minute video)
- `is_completed`: false (until video finishes)

---

### 5.4 Resume Video Playback

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.4.1 | Close course player | Player closes | ☐ | |
| 5.4.2 | Re-open same lesson | Lesson loads | ☐ | |
| 5.4.3 | Check video position | Resumes from last position | ☐ | |
| 5.4.4 | Verify time | Video starts at ~60 seconds | ☐ | |

---

### 5.5 Read Text Lesson
**Component:** `TextLesson.tsx`

**Test Lesson:** "Understanding Type Annotations" (Text only)

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.5.1 | Click on text lesson | Text content displays | ☐ | |
| 5.5.2 | Check formatting | Headers, code blocks formatted | ☐ | |
| 5.5.3 | Verify readability | Text is readable, proper spacing | ☐ | |
| 5.5.4 | Scroll through content | All content visible | ☐ | |

---

### 5.6 Complete Lesson

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.6.1 | Watch video to end | Video completes | ☐ | |
| 5.6.2 | Check auto-completion | Lesson marked complete automatically | ☐ | |
| 5.6.3 | Or click "Mark as Complete" | Manual completion works | ☐ | |
| 5.6.4 | Verify checkmark | Checkmark appears next to lesson | ☐ | |
| 5.6.5 | Check database | is_completed = true | ☐ | |

**API Endpoint:** `POST /courses/{courseId}/lessons/{lessonId}/complete`

---

### 5.7 Lesson Navigation

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.7.1 | Click "Next Lesson" | Navigates to next lesson | ☐ | |
| 5.7.2 | Verify next lesson loads | Correct lesson displays | ☐ | |
| 5.7.3 | Click "Previous Lesson" | Navigates to previous lesson | ☐ | |
| 5.7.4 | Check cross-module navigation | Works across module boundaries | ☐ | |
| 5.7.5 | On last lesson | "Next" button disabled/hidden | ☐ | |

---

### 5.8 Course Progress Calculation

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 5.8.1 | Complete 1 of 5 lessons | Course shows 20% progress | ☐ | |
| 5.8.2 | Complete 2 more lessons | Course shows 60% progress | ☐ | |
| 5.8.3 | Check dashboard | Progress reflected in dashboard | ☐ | |
| 5.8.4 | Complete all lessons | Course shows 100% progress | ☐ | |

**Database Verification:**
```sql
SELECT progress_percentage FROM user_course_enrollments
WHERE user_id = '<user-id>' AND course_id = '<course-id>';
```

---

## 6. Student Dashboard

### 6.1 View Dashboard
**Component:** `StudentDashboard.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 6.1.1 | Navigate to dashboard | Dashboard loads | ☐ | |
| 6.1.2 | Check welcome message | User name displayed | ☐ | |
| 6.1.3 | View subscription status | Current tier shown | ☐ | |
| 6.1.4 | Check user stats | Enrolled courses count shown | ☐ | |
| 6.1.5 | View active courses | Enrolled courses listed | ☐ | |
| 6.1.6 | Check course progress | Progress bars for each course | ☐ | |

**API Endpoint:** `GET /courses/enrollments/my`

---

### 6.2 Continue Learning

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 6.2.1 | Click "Continue" on course | Opens to last viewed lesson | ☐ | |
| 6.2.2 | Verify lesson position | Correct lesson loads | ☐ | |
| 6.2.3 | For video lessons | Resumes from last position | ☐ | |

---

## 7. Insurance Activation

### 7.1 Access Insurance
**Component:** `InsuranceActivation.tsx`

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 7.1.1 | Navigate to insurance page | Insurance form displays | ☐ | |
| 7.1.2 | Check eligibility | Premium tier users can access | ☐ | |
| 7.1.3 | Non-premium users | Upgrade prompt shown | ☐ | |

---

### 7.2 Activate Insurance

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 7.2.1 | Fill insurance form | All fields accept input | ☐ | |
| 7.2.2 | Upload ID document | File upload works | ☐ | |
| 7.2.3 | Submit form | Insurance policy created | ☐ | |
| 7.2.4 | Check status | Status is "pending_approval" | ☐ | |
| 7.2.5 | View confirmation | Success message shown | ☐ | |

**API Endpoint:** `POST /insurance/activate`

---

## 8. User Profile Management

### 8.1 View Profile

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 8.1.1 | Navigate to profile | Profile page displays | ☐ | |
| 8.1.2 | Check user details | Name, email, phone shown | ☐ | |
| 8.1.3 | View subscription info | Current tier displayed | ☐ | |

---

### 8.2 Update Profile

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 8.2.1 | Edit full name | Name updated successfully | ☐ | |
| 8.2.2 | Edit phone number | Phone updated successfully | ☐ | |
| 8.2.3 | Try to change email | Email change handled correctly | ☐ | |

---

## 9. Cross-Cutting Tests

### 9.1 Authentication & Authorization

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 9.1.1 | Access protected page without login | Redirected to login | ☐ | |
| 9.1.2 | Try to enroll without subscription | Error or upgrade prompt | ☐ | |
| 9.1.3 | Access premium course with entry tier | Access denied | ☐ | |
| 9.1.4 | JWT token expiry | Handled gracefully | ☐ | |

---

### 9.2 Error Handling

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 9.2.1 | Disconnect internet | Offline message shown | ☐ | |
| 9.2.2 | Backend is down | User-friendly error message | ☐ | |
| 9.2.3 | Invalid course ID | 404 error handled | ☐ | |
| 9.2.4 | API timeout | Timeout handled gracefully | ☐ | |

---

### 9.3 Performance

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 9.3.1 | Load course catalog | Loads in < 2 seconds | ☐ | |
| 9.3.2 | Video player initialization | Loads in < 3 seconds | ☐ | |
| 9.3.3 | Dashboard load | Loads in < 2 seconds | ☐ | |
| 9.3.4 | Progress save | Completes in < 500ms | ☐ | |

---

### 9.4 Mobile Responsiveness

| Step | Action | Expected Result | Status | Notes |
|------|--------|-----------------|--------|-------|
| 9.4.1 | View on mobile (375px width) | Layout adapts correctly | ☐ | |
| 9.4.2 | Course player on mobile | Sidebar collapses/hamburger menu | ☐ | |
| 9.4.3 | Payment form on mobile | Form is usable | ☐ | |
| 9.4.4 | Video playback on mobile | Video plays correctly | ☐ | |

---

## 10. Data Integrity Tests

### 10.1 Database Consistency

Run these SQL queries to verify data integrity:

```sql
-- Check orphaned enrollments (enrollments without valid subscriptions)
SELECT e.* FROM user_course_enrollments e
LEFT JOIN user_subscriptions s ON e.user_id = s.user_id
WHERE s.id IS NULL OR s.status != 'active';

-- Check course progress matches lesson progress
SELECT
  e.course_id,
  e.progress_percentage as enrollment_progress,
  COALESCE(
    (SELECT COUNT(*) FROM user_lesson_progress lp
     JOIN course_lessons l ON lp.lesson_id = l.id
     JOIN course_modules m ON l.module_id = m.id
     WHERE m.course_id = e.course_id
     AND lp.user_id = e.user_id
     AND lp.is_completed = true) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM course_lessons l
     JOIN course_modules m ON l.module_id = m.id
     WHERE m.course_id = e.course_id), 0),
    0
  ) as calculated_progress
FROM user_course_enrollments e
WHERE e.user_id = '<user-id>';

-- Check payment-subscription linkage
SELECT p.*, s.status as subscription_status
FROM payments p
LEFT JOIN user_subscriptions s ON p.subscription_id = s.id
WHERE p.status = 'completed' AND s.status != 'active';
```

---

## Test Results Summary

### Overall Statistics
- **Total Test Cases:** _____
- **Passed:** _____
- **Failed:** _____
- **Skipped:** _____
- **Pass Rate:** _____%

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Non-Critical Issues
1. _______________________________________________
2. _______________________________________________

### Recommendations
1. _______________________________________________
2. _______________________________________________

---

## Appendix

### A. Test Environment Details
- **Backend Version:** _____
- **Database Version:** PostgreSQL _____
- **Browser:** _____
- **OS:** _____
- **Screen Resolution:** _____

### B. Sample Test Users

Create these users for different scenarios:

```sql
-- Free tier user
INSERT INTO users (email, password_hash, full_name)
VALUES ('free@test.com', '<hashed>', 'Free User');

-- Entry tier user (with active subscription)
-- Premium tier user (with active subscription)
-- Expired subscription user
```

### C. Quick Database Queries

```sql
-- Check all users
SELECT id, email, full_name, created_at FROM users;

-- Check subscriptions
SELECT u.email, s.status, pt.name as tier
FROM user_subscriptions s
JOIN users u ON s.user_id = u.id
JOIN pricing_tiers pt ON s.tier_id = pt.id;

-- Check enrollments with progress
SELECT u.email, c.title, e.progress_percentage
FROM user_course_enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id;

-- Check payments
SELECT u.email, p.amount, p.status, p.payment_method
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

### D. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| JWT token expired | Implement token refresh logic |
| Video not loading | Check Vimeo video ID, verify CORS |
| Progress not saving | Check network tab, verify authentication |
| Payment not processing | Check backend logs, verify subscription exists |

---

## Sign-off

**Tester Signature:** ___________________
**Date:** ___________________

**Product Owner Approval:** ___________________
**Date:** ___________________
