# Framer Integration Guide - Masheleng University Portal

Complete guide to integrate your Framer frontend with the NestJS backend.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Framer Setup](#framer-setup)
4. [Code Components](#code-components)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Quick Start

### Prerequisites

- ✅ NestJS backend running (completed)
- ✅ Docker installed and running
- ✅ Framer account with access to the project
- ⬜ ngrok installed (we'll do this now)

### Time Estimate

- Backend setup: 30 minutes
- Framer setup: 1 hour
- Building components: 6-7 hours
- **Total: ~8-9 hours**

---

## Backend Setup

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Verify installation
ngrok version
```

### Step 2: Configure ngrok

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your auth token from the dashboard
3. Run:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Development Environment

```bash
cd /Users/thando/Documents/masheleng-university-portal

# Make sure Docker is running first!

# Start everything (backend + ngrok tunnel)
./scripts/start-dev-tunnel.sh
```

This script will:
- ✅ Start Docker (PostgreSQL & Redis)
- ✅ Start NestJS backend on http://localhost:3000
- ✅ Start ngrok tunnel and display the public URL

**IMPORTANT:** Copy the ngrok URL that appears! You'll need it for Framer.

Example: `https://abc123.ngrok-free.app`

---

## Framer Setup

### Step 1: Create Code Files in Framer

1. Open your Framer project
2. Go to **File → Code File → New Code File**
3. Create the following files:

#### File 1: `api-client.js`

Copy the contents of `/framer-integration/api-client.js` into this file.

This file contains all the API methods you'll need:
- `api.login(email, password)`
- `api.register(userData)`
- `api.getCourses()`
- `api.enrollInCourse(courseId)`
- And many more...

#### File 2: `config.js`

Copy the contents of `/framer-integration/config.js` into this file.

**CRITICAL:** Update line 13 with your ngrok URL:

```javascript
const DEV_API_URL = 'https://YOUR-NGROK-URL.ngrok-free.app/api/v1';
```

Replace `YOUR-NGROK-URL` with the actual ngrok URL from your terminal!

### Step 2: Test API Connection

Create a test component to verify everything works:

1. In Framer: **Insert → Code → Code Component**
2. Name it `APITest`
3. Paste this code:

```typescript
import { useState, useEffect } from "react"
import { MashelengAPI } from "./api-client"
import { API_URL } from "./config"

export default function APITest() {
  const [status, setStatus] = useState("Testing...")
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      const api = new MashelengAPI(API_URL)
      const response = await api.getSubscriptionTiers()
      setTiers(response)
      setStatus("✅ Connection successful!")
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: 40, backgroundColor: "#f0f0f0" }}>
      <h2>{status}</h2>
      {tiers.length > 0 && (
        <div>
          <h3>Found {tiers.length} subscription tiers:</h3>
          {tiers.map((tier) => (
            <div key={tier.id}>• {tier.tier_name}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

4. Add this component to your canvas
5. Preview the page

**Expected result:** You should see "✅ Connection successful!" and a list of 3 tiers.

**If you see an error:** Check the [Troubleshooting](#troubleshooting) section.

---

## Code Components

All components are ready to copy-paste. Find them in the `components/` directory.

### Component 1: Pricing Tiers (Landing Page)

**File:** Create new code component named `PricingTiers`

See complete code in: `components/PricingTiers.tsx`

**Usage in Framer:**
1. Insert the code component on your landing page
2. Style the wrapper frame as needed
3. The component fetches and displays all subscription tiers

---

### Component 2: Login Form

**File:** Create new code component named `LoginForm`

See complete code in: `components/LoginForm.tsx`

**Usage in Framer:**
1. Create a Login page in Framer
2. Insert the LoginForm component
3. When users login successfully, they're redirected to `/dashboard`

---

### Component 3: Register Form

**File:** Create new code component named `RegisterForm`

See complete code in: `components/RegisterForm.tsx`

**Usage in Framer:**
1. Create a Register page in Framer
2. Insert the RegisterForm component
3. Users are auto-logged in and redirected after registration

---

### Component 4: Course Catalog

**File:** Create new code component named `CourseCatalog`

See complete code in: `components/CourseCatalog.tsx`

**Usage in Framer:**
1. Create a Courses page
2. Insert the CourseCatalog component
3. Users can browse and enroll in courses

---

### Component 5: Student Dashboard

**File:** Create new code component named `StudentDashboard`

See complete code in: `components/StudentDashboard.tsx`

**Usage in Framer:**
1. Create a Dashboard page
2. Insert the StudentDashboard component
3. Shows user profile, subscription, courses, and payments

---

## Testing

### Daily Development Workflow

1. **Start backend + ngrok:**
   ```bash
   ./scripts/start-dev-tunnel.sh
   ```

2. **If ngrok URL changed:**
   - Copy the new URL from terminal
   - Update `config.js` in Framer
   - Reload Framer preview

3. **Test user flow:**
   - [ ] View pricing on landing page
   - [ ] Register new account
   - [ ] Login with credentials
   - [ ] Browse courses
   - [ ] Enroll in a course
   - [ ] View dashboard

### Common Test Scenarios

**Test 1: Free Tier User**
1. Register with email `test@example.com`
2. Should auto-redirect to dashboard
3. Subscribe to Entry tier (free)
4. Should be able to enroll in Entry-level courses
5. Should NOT be able to enroll in Premium courses

**Test 2: Premium User**
1. Register with different email
2. Subscribe to Premium tier
3. Payment will be "pending" - confirm manually in database or API
4. Once active, can enroll in both Entry and Premium courses

---

## Troubleshooting

### Issue: CORS errors in browser console

**Symptoms:**
```
Access to fetch at 'https://...' from origin 'https://university.masheleng.com'
has been blocked by CORS policy
```

**Solutions:**
1. Verify `config.js` has correct ngrok URL
2. Check `.env.development` includes: `https://university.masheleng.com,https://*.ngrok-free.app`
3. Restart the backend: `./scripts/start-dev-tunnel.sh`

---

### Issue: "401 Unauthorized" errors

**Symptoms:** API calls fail with 401 status

**Solutions:**
1. Clear localStorage in browser DevTools
2. Login again
3. Check JWT expiry in `.env.development` (default: 15 minutes)

---

### Issue: ngrok URL changes frequently

**Symptoms:** After restarting ngrok, Framer can't connect

**Solutions:**
1. **Free tier:** Update `config.js` with new URL every time
2. **Paid tier ($8/mo):** Get a stable subdomain that never changes

---

### Issue: "Network request failed"

**Symptoms:** Can't connect to API at all

**Solutions:**
1. Verify backend is running: Check http://localhost:3000/api/v1/health
2. Verify ngrok is running: Check http://localhost:4040
3. Check ngrok URL is correct in `config.js`

---

### Issue: ngrok "Visit Site" warning page

**Symptoms:** First time visiting ngrok URL shows a warning

**Solutions:**
- This is normal for free tier
- Click "Visit Site" button
- Paid tier removes this warning

---

## Production Deployment

When ready to deploy to production:

### Step 1: Deploy Backend

Choose a hosting provider:
- **Recommended:** DigitalOcean App Platform (easy)
- **Alternative:** Heroku, Railway, AWS, Google Cloud

Follow your provider's NestJS deployment guide.

### Step 2: Configure DNS

1. Point `api.masheleng.com` to your backend server
2. Set up SSL certificate (free via Let's Encrypt)

### Step 3: Update Framer

In `config.js`, update:

```javascript
const PROD_API_URL = 'https://api.masheleng.com/api/v1';
```

### Step 4: Security Checklist

- [ ] Remove ngrok from CORS allowed origins
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure database backups
- [ ] Enable SSL for database connections
- [ ] Review and rotate all secrets

---

## API Endpoints Reference

All available endpoints in the API client:

### Authentication
- `api.register(userData)` - Register new user
- `api.login(email, password)` - Login
- `api.logout()` - Logout (client-side)
- `api.getCurrentUser()` - Get profile
- `api.isAuthenticated()` - Check if logged in

### Subscriptions
- `api.getSubscriptionTiers()` - List all tiers (public)
- `api.subscribe({tier_id})` - Subscribe to tier
- `api.getMySubscription()` - Get active subscription
- `api.getSubscriptionHistory()` - Get history
- `api.cancelSubscription()` - Cancel subscription

### Courses
- `api.getCourses()` - List all courses (public)
- `api.getCourseById(id)` - Get course details
- `api.enrollInCourse(id)` - Enroll in course
- `api.getMyEnrollments()` - Get my courses

### Payments
- `api.createPayment(data)` - Create payment
- `api.confirmPayment(id)` - Confirm payment
- `api.getPaymentHistory()` - Get payments
- `api.getPendingPayments()` - Get pending

---

## Support & Next Steps

**Questions?**
- Check the detailed plan in: `/Users/thando/.claude/plans/kind-dancing-giraffe.md`
- Review agent output in plan agent ID: a6365e7

**After Basic Integration:**
1. Add course content (modules/lessons)
2. Implement real payment gateway
3. Add email notifications
4. Create admin panel
5. Build course player/viewer

**Production Timeline:**
- MVP ready: After implementing 4 priority components
- Beta testing: 1-2 weeks
- Production launch: When ready to deploy backend

---

## File Structure

```
masheleng-university-portal/
├── framer-integration/
│   ├── README.md (this file)
│   ├── api-client.js (copy to Framer)
│   ├── config.js (copy to Framer)
│   └── components/
│       ├── PricingTiers.tsx
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── CourseCatalog.tsx
│       └── StudentDashboard.tsx
├── scripts/
│   └── start-dev-tunnel.sh
└── src/
    └── main.ts (CORS updated)
```

---

## Version History

- **v1.0.0** - December 2025 - Initial integration

---

**Ready to start coding?** Begin with the [Framer Setup](#framer-setup) section!
