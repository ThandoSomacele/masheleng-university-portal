# Framer Integration Guide - CourseDetail Component

## ✅ API Testing Complete

All backend APIs are working correctly:
- ✅ Login/Authentication
- ✅ Course listing (public)
- ✅ Course detail (requires subscription)
- ✅ Course curriculum (with LessonProgress entity fix)
- ✅ Error handling (400, 401, 403, 404)

### Current ngrok URL
```
https://566517f62a69.ngrok-free.app/api/v1
```
**Note:** This URL changes when ngrok restarts (free tier). Update config.js when it changes.

### Test User Credentials
```
Email: test1@example.com
Password: Test123!
Status: ✅ Active subscription (Entry tier, access_level: 1)
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Valid Course UUIDs
```
11111111-1111-1111-1111-111111111111  (Introduction to TypeScript)
22222222-1111-1111-1111-111111111111  (Web Development Fundamentals)
33333333-1111-1111-1111-111111111111  (Business Management Basics)
```

---

## 📋 Files to Copy to Framer

### 1. config.js (UPDATED)
**Location:** `framer-integration/config.js`

**Changes:** Updated ngrok URL to current one

**How to copy:**
1. Open your Framer project at framer.com
2. Go to Code Files panel
3. Find `config.js`
4. Replace entire contents with the updated file

### 2. CourseDetail.tsx (UPDATED)
**Location:** `framer-integration/components/CourseDetail.tsx`

**Changes:**
- Enhanced debug logging to show courseId extraction process
- Better error messages for subscription requirements
- Improved API call logging

**How to copy:**
1. Open your Framer project
2. Go to Code Components or Code Files
3. Find `CourseDetail.tsx`
4. Replace entire contents with the updated file
5. **Hard refresh preview:** Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

---

## 🎯 Setting Up the Framer Page

### IMPORTANT: Framer Route Limitations

Framer **does NOT** support React Router-style route parameters as props!

- ❌ No `params.courseId`
- ❌ No automatic prop passing from routes
- ✅ CourseDetail component **auto-extracts** UUID from URL

### Step 1: Create the Page

1. In Framer, create a new page
2. Set the page **URL/Slug** to one of these:
   - `courses/22222222-1111-1111-1111-111111111111` (specific course)
   - Or just: `22222222-1111-1111-1111-111111111111`

### Step 2: Add the Component

1. Drag the `CourseDetail` component onto the page
2. **DO NOT** try to pass `courseId` as a prop
3. The component will automatically extract the UUID from the URL

### Step 3: Test in Preview

1. Hard refresh: Cmd+Shift+R (Mac)
2. Open browser console (F12)
3. Look for debug logs:
   ```
   🔍 CourseDetail - Debugging courseId extraction:
     - courseIdProp: undefined
     - window.location.pathname: /courses/22222222-1111-1111-1111-111111111111
     - Path segments: ["courses", "22222222-1111-1111-1111-111111111111"]
   ✅ Strategy 1: Extracted courseId from /courses/ path: 22222222-1111-1111-1111-111111111111
   🎯 Final courseId: 22222222-1111-1111-1111-111111111111
   ```

### Expected Console Output

If everything is working:
```
🔧 Masheleng API Config: {apiUrl: 'https://566517f62a69.ngrok-free.app/api/v1', environment: 'development', version: '1.0.0'}
🔍 CourseDetail - Debugging courseId extraction:
  - courseIdProp: undefined
  - window.location.pathname: /courses/22222222-1111-1111-1111-111111111111
  - API_URL: https://566517f62a69.ngrok-free.app/api/v1
  - Path segments: ["courses", "22222222-1111-1111-1111-111111111111"]
✅ Strategy 1: Extracted courseId from /courses/ path: 22222222-1111-1111-1111-111111111111
🎯 Final courseId: 22222222-1111-1111-1111-111111111111
🔐 Authentication status: Logged in
📡 Fetching course: 22222222-1111-1111-1111-111111111111
📥 API Call: GET /courses/22222222-1111-1111-1111-111111111111
✅ Course data loaded: Web Development Fundamentals
📥 API Call: GET /courses/enrollments/my
📝 Enrollment status: Not enrolled
📥 API Call: GET /courses/22222222-1111-1111-1111-111111111111/curriculum
✅ Curriculum loaded: 2 modules
```

---

## 🧪 Running E2E Tests

### 1. Backend API Tests (Jest/Supertest)

**File:** `test/courses-e2e.spec.ts`

```bash
# Run the test
npm run test:e2e test/courses-e2e.spec.ts

# Or using Jest directly
npx jest test/courses-e2e.spec.ts
```

**What it tests:**
- ✅ Public courses endpoint
- ✅ Authentication required for course details
- ✅ UUID validation (400 for invalid)
- ✅ 404 for non-existent courses
- ✅ 403 for users without subscription
- ✅ Curriculum loading without LessonProgress errors
- ✅ Course enrollment

### 2. Quick API Test Script

**File:** `test-api.sh`

```bash
# Run the test script
./test-api.sh
```

This script:
1. Gets current ngrok URL
2. Registers/logs in test user
3. Subscribes user to Entry tier
4. Tests all course endpoints
5. Returns JWT token for manual testing

### 3. Browser E2E Tests (Playwright)

**File:** `test/framer-course-detail.e2e.ts`

**Prerequisites:**
1. Install Playwright: `npm install -D @playwright/test`
2. Install browsers: `npx playwright install`
3. Update `FRAMER_SITE_URL` in the test file

```bash
# Run Playwright tests
npx playwright test test/framer-course-detail.e2e.ts

# Run with UI
npx playwright test test/framer-course-detail.e2e.ts --ui

# Run with debug mode
npx playwright test test/framer-course-detail.e2e.ts --debug
```

**What it tests:**
- ✅ Login flow and token storage
- ✅ CourseId extraction from URL
- ✅ Course data loading
- ✅ Curriculum loading without errors
- ✅ Error handling for missing courseId
- ✅ No LessonProgress entity errors

---

## 🔧 Troubleshooting

### Issue: "Validation failed (uuid is expected)"

**Cause:** CourseId is `undefined` or invalid format

**Fix:**
1. Check console logs for courseId extraction
2. Verify the Framer page URL contains the UUID
3. Make sure you're using a valid UUID from the seed data

### Issue: "You need an active subscription"

**Cause:** User is logged in but has no subscription

**Fix:**
1. Use the test user `test1@example.com` (already has subscription)
2. Or manually subscribe via API:
```bash
# Get tiers
curl https://566517f62a69.ngrok-free.app/api/v1/subscriptions/tiers

# Subscribe
curl -X POST https://566517f62a69.ngrok-free.app/api/v1/subscriptions/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier_id":"TIER_ID","payment_frequency":"monthly"}'
```

### Issue: Old ngrok URL in console

**Cause:** Framer is caching the old config.js file

**Fix:**
1. Update `config.js` in Framer with new ngrok URL
2. Hard refresh preview: Cmd+Shift+R
3. Clear browser cache if needed

### Issue: 404 on Framer page

**Cause:** The page/route doesn't exist in Framer

**Fix:**
1. Create a new page in Framer
2. Set the URL to include the course UUID
3. Add the CourseDetail component to the page

---

## 📊 Summary of Changes

### Backend (Already Applied)
- ✅ Fixed `LessonProgress` entity name in `lesson-progress.entity.ts`
- ✅ Added `LessonProgress` to `database.module.ts` entities array
- ✅ Server restarted - all endpoints working

### Frontend (Copy to Framer)
- ✅ Updated `config.js` with current ngrok URL
- ✅ Enhanced `CourseDetail.tsx` with debug logging
- ✅ Component auto-extracts courseId from any URL with UUID

### Testing (New Files)
- ✅ Created `test/courses-e2e.spec.ts` - Backend API tests
- ✅ Created `test-api.sh` - Quick API verification script
- ✅ Created `test/framer-course-detail.e2e.ts` - Browser tests

---

## 🎉 Next Steps

1. **Copy files to Framer**
   - Copy updated `config.js`
   - Copy updated `CourseDetail.tsx`

2. **Create Framer page**
   - URL: `/courses/22222222-1111-1111-1111-111111111111`
   - Add CourseDetail component

3. **Test in preview**
   - Login with test1@example.com / Test123!
   - Navigate to course page
   - Check console for debug logs

4. **Run automated tests** (optional)
   - `./test-api.sh` - Verify API
   - `npx jest test/courses-e2e.spec.ts` - Run backend tests
   - `npx playwright test test/framer-course-detail.e2e.ts` - Run browser tests

---

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for debug logs (F12)
2. Run `./test-api.sh` to verify backend is working
3. Verify ngrok URL matches in config.js
4. Make sure you're logged in as test1@example.com
5. Check that the Framer page URL contains a valid course UUID
