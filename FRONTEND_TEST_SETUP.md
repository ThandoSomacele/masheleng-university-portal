# Frontend Testing Setup Guide
## Quick Start for Framer Integration

**Backend Status:** ✅ Running on https://1bde3222dd89.ngrok-free.app

---

## Step 1: Update API URL in Framer Components

All your Framer components need to point to the ngrok URL. Update the `API_URL` constant in each component:

### Components to Update:

**Location:** `framer-integration/components/`

1. **StudentDashboard.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

2. **CourseCatalog.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

3. **CourseDetail.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

4. **CoursePlayer.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

5. **PaymentForm.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

6. **InsuranceActivation.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

7. **RegisterForm.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

8. **LoginForm.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

9. **PricingTiers.tsx**
   ```typescript
   const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
   ```

---

## Step 2: Quick API Verification

Before testing in Framer, verify the backend is working:

### Test 1: Health Check
```bash
curl https://1bde3222dd89.ngrok-free.app/api/v1/auth/health
```
**Expected:** Server is running

### Test 2: Get Courses
```bash
curl https://1bde3222dd89.ngrok-free.app/api/v1/courses
```
**Expected:** JSON array with 3 courses

### Test 3: Get Pricing Tiers
```bash
curl https://1bde3222dd89.ngrok-free.app/api/v1/subscriptions/tiers
```
**Expected:** JSON array with Free, Entry, Premium tiers

---

## Step 3: Test User Registration (Browser Console)

Open your browser console on the Framer page and run:

```javascript
const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';

// Test registration
fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test1@example.com',
    password: 'Test123!',
    full_name: 'Test User One',
    phone_number: '+267 71 111 111'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Registration successful:', data);
    localStorage.setItem('token', data.access_token);
    console.log('Token saved to localStorage');
  })
  .catch(err => console.error('Registration failed:', err));
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test1@example.com",
    "full_name": "Test User One"
  }
}
```

---

## Step 4: Test Login (Browser Console)

```javascript
const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';

fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test1@example.com',
    password: 'Test123!'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Login successful:', data);
    localStorage.setItem('token', data.access_token);
    console.log('Token saved to localStorage');
  })
  .catch(err => console.error('Login failed:', err));
```

---

## Step 5: Test Authenticated API Call

```javascript
const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
const token = localStorage.getItem('token');

// Get user's enrollments
fetch(`${API_URL}/courses/enrollments/my`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('My enrollments:', data))
  .catch(err => console.error('Error:', err));
```

---

## Step 6: Manual Testing Checklist

### Registration & Login Flow
- [ ] Navigate to registration page in Framer
- [ ] Fill in registration form
- [ ] Submit → Should receive success message
- [ ] Navigate to login page
- [ ] Login with same credentials
- [ ] Should be redirected to dashboard

### Pricing & Subscription
- [ ] View pricing tiers page
- [ ] All 3 tiers display correctly
- [ ] Click "Get Started" on Entry tier
- [ ] Subscription created
- [ ] Redirected to payment page

### Payment Flow
- [ ] Select payment method (Card)
- [ ] Fill payment form
- [ ] Submit payment
- [ ] Verify payment created in database

### Course Browsing
- [ ] Navigate to course catalog
- [ ] All 3 courses visible
- [ ] Click on "Introduction to TypeScript"
- [ ] Course details display
- [ ] Curriculum shows modules and lessons

### Course Enrollment
- [ ] Click "Enroll Now"
- [ ] Enrollment successful
- [ ] Button changes to "Continue Learning"

### Video Playback
- [ ] Click "Continue Learning"
- [ ] Course player opens
- [ ] Video loads and plays
- [ ] Progress saves automatically

---

## Common Issues & Solutions

### Issue: 403 Forbidden from ngrok
**Cause:** ngrok free tier browser warning
**Solution:** Add `ngrok-skip-browser-warning: true` header

Update your API client:
```typescript
headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(token && { Authorization: `Bearer ${token}` })
}
```

### Issue: CORS errors
**Cause:** Backend CORS not configured for ngrok URL
**Solution:** Already configured in `main.ts` with `origin: true`

### Issue: JWT token expired
**Cause:** Token validity period passed
**Solution:** Login again to get fresh token

### Issue: Video won't play
**Cause:** Vimeo video privacy settings
**Solution:** Videos must be public or unlisted, not private

---

## Database Quick Checks

### Check if user was created:
```bash
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal \
  -c "SELECT id, email, full_name FROM users WHERE email = 'test1@example.com';"
```

### Check subscription:
```bash
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal \
  -c "SELECT u.email, s.status, pt.name as tier
      FROM user_subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN pricing_tiers pt ON s.tier_id = pt.id
      WHERE u.email = 'test1@example.com';"
```

### Check payments:
```bash
PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal \
  -c "SELECT p.id, p.amount, p.status, p.payment_method
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'test1@example.com';"
```

---

## Confirm Payment (Admin Action)

To activate a subscription after payment is created:

```bash
# Get payment ID
PAYMENT_ID=$(PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng \
  -d masheleng_portal -t -c \
  "SELECT id FROM payments WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1;" | xargs)

# Get user token (from browser localStorage or login response)
TOKEN="<paste-token-here>"

# Confirm payment
curl -X POST https://1bde3222dd89.ngrok-free.app/api/v1/payments/$PAYMENT_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_reference": "TEST-001"}'
```

---

## Testing Workflow Summary

```
1. Update API URLs in components ✓
2. Test backend APIs (curl) ✓
3. Test registration (browser console) ✓
4. Test login (browser console) ✓
5. Test in Framer UI:
   - Register new user
   - Login
   - View pricing
   - Subscribe to Entry tier
   - Make payment
   - Confirm payment (admin)
   - Browse courses
   - Enroll in course
   - Watch video lesson
   - Check progress
```

---

## Next Steps After Basic Testing

1. **Follow QUICK_TEST_GUIDE.md** for complete 30-minute test
2. **Follow E2E_TEST_PLAN.md** for comprehensive testing
3. **Document bugs** in GitHub Issues
4. **Test all payment methods** (Card, Bank, Mobile, Manual)
5. **Test mobile responsiveness**
6. **Load testing** with multiple users

---

## Support

**Backend Logs:** Check terminal running `./scripts/start-dev-tunnel.sh`
**ngrok Dashboard:** http://localhost:4040
**API Docs:** https://1bde3222dd89.ngrok-free.app/api/docs

---

**Last Updated:** 2025-12-29
**ngrok URL:** https://1bde3222dd89.ngrok-free.app
**Status:** ✅ Ready for Testing
