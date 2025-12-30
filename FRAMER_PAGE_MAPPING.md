# Framer Page Mapping & Component Setup

**Date:** December 30, 2025
**Purpose:** Complete guide for setting up Framer pages with the correct components and navigation flow

---

## 📄 Core Pages (Must Create)

These are the essential pages that need to be created in Framer:

| Framer Page URL | Component to Use | Dynamic Props Needed | Description |
|----------------|------------------|---------------------|-------------|
| `/login` | **LoginForm** | None | User login page |
| `/register` or `/signup` | **RegisterForm** | None | New user registration |
| `/pricing` | **PricingTiers** | None | Subscription tier selection |
| `/dashboard` | **StudentDashboard** | None | Student dashboard (requires login) |
| `/courses` | **CourseCatalog** | None | Browse all courses |
| `/courses/:id` | **CourseDetail** | `courseId` (from URL) | Individual course overview |
| `/courses/:id/learn` | **CoursePlayer** | `courseId` (from URL)<br>`initialLessonId` (from query param) | Active learning/viewing page |
| `/payment` or `/checkout` | **PaymentWorkflow** | `subscriptionId`<br>`amount`<br>`currency`<br>`tierName` | Complete payment flow |
| `/insurance/activate` | **InsuranceActivation** | None | Activate funeral insurance |

---

## 📋 Additional Pages Referenced

These pages are referenced in component links but don't have dedicated components yet. Create placeholder pages for these:

| Framer Page URL | Purpose | Linked From |
|----------------|---------|-------------|
| `/account/subscription` | Manage subscription settings | StudentDashboard |
| `/account/settings` | User profile & account settings | StudentDashboard |
| `/insurance/policies` | View insurance policies | StudentDashboard, InsuranceActivation |
| `/support` | Customer support/help | StudentDashboard |

---

## 🧩 Sub-Components (Don't Need Pages)

These are used **within** other components and don't need their own pages:

- **PaymentMethodSelector** → Used in PaymentWorkflow
- **PaymentForm** → Used in PaymentWorkflow
- **PaymentSuccess** → Used in PaymentWorkflow
- **PaymentFailed** → Used in PaymentWorkflow
- **VimeoPlayer** → Used in CoursePlayer
- **TextLesson** → Used in CoursePlayer

---

## 🔄 Navigation Flow

### **Login/Registration Flow**
```
/login → (success) → /dashboard or /courses
/register → (success) → /dashboard or /courses
```

**Components involved:**
- LoginForm.tsx (line 77: `href='/dashboard'`)
- LoginForm.tsx (line 80: `href='/courses'`)
- RegisterForm.tsx (line 77: `href='/dashboard'`)
- RegisterForm.tsx (line 80: `href='/courses'`)

---

### **Pricing/Payment Flow**
```
/pricing → (no login) → /login
/pricing → (subscribe button clicked) → /payment
/payment → (success) → /dashboard
```

**Components involved:**
- PricingTiers.tsx (line 40: redirects to `/login` if no token)
- PricingTiers.tsx (line 50: redirects to `/dashboard` after subscribe)
- PaymentWorkflow.tsx (line 82: redirects to `/dashboard` on complete)

---

### **Course Enrollment Flow**
```
/courses → (view course) → /courses/:id
/courses/:id → (no login + enroll) → /login
/courses/:id → (enrolled + start learning) → /courses/:id/learn?lesson=:lessonId
```

**Components involved:**
- CourseCatalog.tsx (line 39: redirects to `/login` if no token)
- CourseDetail.tsx (line 84: `window.location.href = '/courses/${courseId}/learn?lesson=${firstLesson.id}'`)
- CourseDetail.tsx (line 93: `window.location.href = '/courses/${courseId}/learn?lesson=${lesson.id}'`)

---

### **Dashboard Flow**
```
/dashboard → (no login) → /login
/dashboard → (logout) → /login
/dashboard → Quick Actions → /courses, /pricing, /account/subscription, /insurance/activate
```

**Components involved:**
- StudentDashboard.tsx (line 24: redirects to `/login` if no token)
- StudentDashboard.tsx (line 74: `window.location.href = '/login'` on logout)
- StudentDashboard.tsx (line 183: `href='/account/subscription'`)
- StudentDashboard.tsx (line 222: `href='/insurance/policies'`)
- StudentDashboard.tsx (line 229: `href='/insurance/activate'`)
- StudentDashboard.tsx (line 240: `href='/courses'`)
- StudentDashboard.tsx (line 245: `href='/pricing'`)
- StudentDashboard.tsx (line 250: `href='/account/settings'`)
- StudentDashboard.tsx (line 255: `href='/support'`)
- StudentDashboard.tsx (line 295: `href='/courses/${enrollment.course?.id}'`)

---

### **Insurance Flow**
```
/insurance/activate → (no login) → /login
/insurance/activate → (success) → /dashboard or /insurance/policies
```

**Components involved:**
- InsuranceApplication.tsx (line 81: redirects to `/login` if no token)
- InsuranceApplication.tsx (line 109: `href='/dashboard'`)
- InsuranceApplication.tsx (line 112: `href='/insurance/policies'`)

---

## ⚙️ Dynamic Props Setup in Framer

### **1. `/courses/:id` (CourseDetail)**

This page needs the course ID from the URL.

**Framer Setup:**
```typescript
// In Framer, extract courseId from route parameters
const courseId = useRouter().params.id; // or Framer's equivalent
```

**Component Usage:**
```typescript
<CourseDetail courseId={courseId} />
```

**Example URL:** `/courses/11111111-1111-1111-1111-111111111111`

---

### **2. `/courses/:id/learn` (CoursePlayer)**

This page needs both the course ID and lesson ID (from query param).

**Framer Setup:**
```typescript
// Extract from URL and query params
const courseId = useRouter().params.id;
const lessonId = useSearchParams().get('lesson'); // or Framer's equivalent
```

**Component Usage:**
```typescript
<CoursePlayer
  courseId={courseId}
  initialLessonId={lessonId}
/>
```

**Example URL:** `/courses/11111111-1111-1111-1111-111111111111/learn?lesson=22222222-2222-2222-2222-222222222222`

---

### **3. `/payment` (PaymentWorkflow)**

This page needs subscription details passed from the pricing tier selection.

**Framer Setup:**
```typescript
// These should be passed when navigating from PricingTiers
// You may need to use URL params or state management
```

**Component Usage:**
```typescript
<PaymentWorkflow
  subscriptionId="uuid-from-tier-selection"
  amount={150}
  currency="BWP"
  tierName="Entry Tier"
/>
```

**Alternative:** You could also pass these via URL query parameters:
```
/payment?subscription=uuid&amount=150&currency=BWP&tier=Entry
```

---

## 🚨 Critical Redirects to Configure

### **Protected Routes (Require Login)**

These pages check for authentication token and redirect to `/login` if not found:

1. **`/dashboard`**
   - Check: StudentDashboard.tsx line 24
   - Redirect: `/login` if no `masheleng_token` in localStorage

2. **`/courses/:id` (Enrollment Action)**
   - Check: CourseDetail.tsx (when trying to enroll)
   - Redirect: Handled by component, but should verify login first

3. **`/payment`**
   - Should verify login before showing payment form
   - Redirect: `/login` if no token

4. **`/insurance/activate`**
   - Check: InsuranceApplication.tsx line 81
   - Redirect: `/login` if no `masheleng_token`

---

### **Success Redirects**

Configure these redirects after successful actions:

| Action | Redirect To | Component Location |
|--------|-------------|-------------------|
| Login success | `/dashboard` or `/courses` | LoginForm.tsx:77-80 |
| Register success | `/dashboard` or `/courses` | RegisterForm.tsx:77-80 |
| Payment success | `/dashboard` | PaymentWorkflow.tsx:82 |
| Insurance activation | `/dashboard` or `/insurance/policies` | InsuranceApplication.tsx:109-112 |
| Subscription purchase | `/dashboard` | PricingTiers.tsx:50 |
| Logout | `/login` | StudentDashboard.tsx:74 |

---

### **Course Navigation Redirects**

| Action | Redirect To | Component Location |
|--------|-------------|-------------------|
| Start Learning | `/courses/:id/learn?lesson=:lessonId` | CourseDetail.tsx:84 |
| Continue Learning | `/courses/:id/learn?lesson=:lessonId` | CourseDetail.tsx:93 |
| Back to Course | `/courses/:id` | CoursePlayer.tsx:185 |
| Back to Catalog | `/courses` | Links from dashboard |

---

## ✅ Implementation Checklist

### **Phase 1: Authentication Pages**
- [ ] Create `/login` page in Framer
- [ ] Add **LoginForm** component to `/login` page
- [ ] Create `/register` page in Framer
- [ ] Add **RegisterForm** component to `/register` page
- [ ] Test login → dashboard redirect
- [ ] Test register → dashboard redirect
- [ ] Verify localStorage token is set after login

---

### **Phase 2: Core Pages**
- [ ] Create `/dashboard` page in Framer
- [ ] Add **StudentDashboard** component to `/dashboard` page
- [ ] Create `/pricing` page in Framer
- [ ] Add **PricingTiers** component to `/pricing` page
- [ ] Create `/courses` page in Framer
- [ ] Add **CourseCatalog** component to `/courses` page
- [ ] Test pricing → login redirect (no auth)
- [ ] Test pricing → payment flow (with auth)
- [ ] Test dashboard → courses navigation

---

### **Phase 3: Course Pages (Dynamic Routes)**
- [ ] Create `/courses/:id` page in Framer (dynamic route)
- [ ] Set up route parameter extraction for `courseId`
- [ ] Add **CourseDetail** component with `courseId` prop
- [ ] Create `/courses/:id/learn` page in Framer (dynamic route)
- [ ] Set up route parameter extraction for `courseId`
- [ ] Set up query parameter extraction for `lesson` param
- [ ] Add **CoursePlayer** component with both props
- [ ] Test course catalog → course detail navigation
- [ ] Test course enrollment flow
- [ ] Test start learning → course player navigation
- [ ] Test lesson navigation (previous/next)

---

### **Phase 4: Payment Flow**
- [ ] Create `/payment` page in Framer
- [ ] Set up prop passing from PricingTiers (subscription details)
- [ ] Add **PaymentWorkflow** component with required props
- [ ] Test complete payment method selection → form → success flow
- [ ] Test payment failed → retry flow
- [ ] Verify redirect to `/dashboard` on payment success
- [ ] Test back button to pricing page

---

### **Phase 5: Insurance**
- [ ] Create `/insurance/activate` page in Framer
- [ ] Add **InsuranceActivation** component
- [ ] Test insurance activation flow
- [ ] Test beneficiary addition/removal
- [ ] Verify redirect to `/dashboard` on success
- [ ] Test link from dashboard → insurance activation

---

### **Phase 6: Additional Pages (Placeholders)**
- [ ] Create `/account/subscription` page
- [ ] Add placeholder content or build subscription management UI
- [ ] Create `/account/settings` page
- [ ] Add placeholder content or build settings UI
- [ ] Create `/insurance/policies` page
- [ ] Add placeholder content or build policy viewer UI
- [ ] Create `/support` page
- [ ] Add placeholder content or support form

---

## 📌 Technical Notes for Framer Setup

### **1. URL Parameters**

For dynamic routes like `/courses/:id`, you'll need to:

```typescript
// Framer's route parameter system (example)
const { id } = useRouter().params;

// Pass to component
<CourseDetail courseId={id} />
```

---

### **2. Query Parameters**

For `/courses/:id/learn?lesson=:lessonId`, you'll need to:

```typescript
// Framer's query parameter system (example)
const lessonId = useSearchParams().get('lesson');

// Pass to component
<CoursePlayer
  courseId={courseId}
  initialLessonId={lessonId}
/>
```

---

### **3. localStorage Authentication**

All components use this pattern for authentication:

```typescript
const token = localStorage.getItem('masheleng_token');

if (!token) {
  window.location.href = '/login';
  return;
}
```

**Important:** Make sure the token is set after successful login/registration:
- LoginForm.tsx sets token after successful API call
- RegisterForm.tsx sets token after successful API call

---

### **4. window.location.href vs Client-Side Navigation**

Components currently use `window.location.href` for redirects, which causes full page reloads. Framer should intercept these and handle them as client-side navigations for better UX.

If you want to use Framer's native navigation:
```typescript
// Instead of: window.location.href = '/dashboard'
// Use: navigate('/dashboard') // or Framer's equivalent
```

---

### **5. Component Preview Mode**

All payment components now have default props for Framer preview mode:

```typescript
// Components work without props in Framer preview
<PaymentForm /> // Shows preview with default values
<PaymentMethodSelector /> // Shows 4 methods with card selected
<PaymentWorkflow /> // Shows complete flow
```

This allows you to:
- Preview components in Framer without errors
- Add components to canvas without required props
- Test UI/UX before connecting to real data

---

## 🎯 Quick Reference: Component Files

All components are located in:
```
/Users/thando/Documents/masheleng-university-portal/framer-integration/components/
```

| Component File | Use For |
|----------------|---------|
| LoginForm.tsx | `/login` page |
| RegisterForm.tsx | `/register` page |
| PricingTiers.tsx | `/pricing` page |
| StudentDashboard.tsx | `/dashboard` page |
| CourseCatalog.tsx | `/courses` page |
| CourseDetail.tsx | `/courses/:id` page |
| CoursePlayer.tsx | `/courses/:id/learn` page |
| PaymentWorkflow.tsx | `/payment` page |
| PaymentMethodSelector.tsx | Sub-component (used in PaymentWorkflow) |
| PaymentForm.tsx | Sub-component (used in PaymentWorkflow) |
| PaymentSuccess.tsx | Sub-component (used in PaymentWorkflow) |
| PaymentFailed.tsx | Sub-component (used in PaymentWorkflow) |
| InsuranceApplication.tsx | `/insurance/activate` page |
| VimeoPlayer.tsx | Sub-component (used in CoursePlayer) |
| TextLesson.tsx | Sub-component (used in CoursePlayer) |

---

## 🔧 API Configuration

All components use centralized API configuration from:
```
/Users/thando/Documents/masheleng-university-portal/framer-integration/config.js
```

**Current API URL:**
```javascript
const API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
```

If the ngrok URL changes, update it in `config.js` and all components will automatically use the new URL.

---

## 📚 Related Documentation

- **Error Fixes:** See `FRAMER_ERROR_FIXES.md` for component prop errors and fixes
- **Troubleshooting:** See `FRAMER_TROUBLESHOOTING.md` for dark theme and styling issues
- **Design System:** See `framer-integration/DESIGN_SYSTEM.md` for color palette and styling
- **Component Updates:** See `COMPONENT_UPDATE_CHECKLIST.md` for design system compliance

---

## ✨ Summary

**Total Pages to Create:** 13 pages (9 core + 4 placeholder)

**Components Available:** 15 components (9 page-level + 6 sub-components)

**All components:**
- ✅ Follow Masheleng dark theme design system
- ✅ Have optional props for Framer preview mode
- ✅ Use centralized API configuration
- ✅ Handle authentication redirects
- ✅ Support navigation flow between pages

**Next Steps:**
1. Start with Phase 1 (Authentication pages)
2. Test login/register flow completely
3. Move to Phase 2 (Core pages)
4. Build out dynamic course pages (Phase 3)
5. Complete payment and insurance flows (Phase 4-5)
6. Add placeholder pages (Phase 6)

---

**Status:** ✅ Ready for Framer Implementation
**Last Updated:** December 30, 2025
