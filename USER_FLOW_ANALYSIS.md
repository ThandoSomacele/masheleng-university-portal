# Masheleng University - User Flow & Component Analysis

## Complete User Journey Map

### 1. **FIRST-TIME VISITOR** (Not Logged In)

#### Landing Page
- **Hero Section** with value proposition
- **Features Overview**
- **Pricing Tiers** (Component: ✅ `PricingTiers.tsx`)
- **CTA**: Sign Up / Login buttons

#### Authentication Flow
- **Login Page** (Component: ✅ `LoginForm.tsx`)
  - Email + Password
  - "Forgot Password" link → Password Reset
  - "Activate License" link → Activation Page

- **Register Page** (Component: ✅ `RegisterForm.tsx`)
  - First Name, Surname, Email, Country, Password
  - On success → Dashboard

- **Forgot Password Page** ❌ MISSING
  - Email input
  - Send reset link
  - Success message

- **Reset Password Page** ❌ MISSING
  - Token validation
  - New password input
  - Confirmation

- **Activate License Page** ❌ MISSING
  - License key input
  - Validation
  - Auto-redirect to dashboard

---

### 2. **NEW USER** (First Login)

#### Dashboard (Component: ✅ `StudentDashboard.tsx`)
Shows:
- Welcome message
- Stats: 0 courses, no subscription
- Empty states with CTAs

#### Onboarding Flow ❌ MISSING
- **Welcome Modal/Page**
  - Tour of platform
  - Quick setup steps
  - Skip option

#### First Actions:
1. **Choose Subscription** → `/pricing`
2. **Browse Courses** → `/courses`
3. **Activate Insurance** → `/insurance/activate`

---

### 3. **SUBSCRIPTION FLOW**

#### Pricing Page
- **Component**: ✅ `PricingTiers.tsx`
- View all tiers (Entry, Premium, Premium+)
- Currency toggle (BWP/ZAR)
- Monthly/Yearly toggle
- "Start Now" button → Payment

#### Payment Flow ❌ MISSING COMPONENTS
- **Payment Method Selection Page**
  - Credit/Debit Card
  - Mobile Money (Orange Money, MyZaka)
  - Bank Transfer

- **Payment Form Page**
  - Card details / Mobile number
  - Billing information
  - Terms acceptance
  - Submit button → Processing

- **Payment Processing Page**
  - Loading state
  - Redirect to payment gateway
  - Return URL handling

- **Payment Success Page**
  - Confirmation message
  - Receipt details
  - "Go to Dashboard" button
  - "Browse Courses" button

- **Payment Failed Page**
  - Error message
  - Retry button
  - "Contact Support" link

---

### 4. **COURSE BROWSING & ENROLLMENT**

#### Course Catalog (Component: ✅ `CourseCatalog.tsx`)
- **View**: List/Grid of all courses
- **Filters**: Category, Level, Duration
- **Search**: By course name/description
- Course cards showing:
  - Course image
  - Title
  - Description
  - Price/Free
  - Enroll button

#### Individual Course Page ❌ MISSING
- **Course Details**:
  - Full description
  - What you'll learn
  - Prerequisites
  - Duration
  - Instructor info
  - Syllabus/Curriculum
  - Student reviews
  - Enroll button

- **Enrollment Confirmation Modal** ❌ MISSING
  - Course summary
  - Price (or "Included in subscription")
  - Confirm enrollment button
  - Success → Add to "My Courses"

#### Course Player/Viewer ❌ MISSING
- **Video Player**
  - Lesson video
  - Playback controls
  - Quality settings
  - Speed controls

- **Course Sidebar**
  - Curriculum list
  - Progress indicators
  - Next lesson button

- **Course Content**
  - Lesson description
  - Downloads/Resources
  - Notes section
  - Assignments

- **Course Navigation**
  - Previous/Next lesson
  - Mark as complete
  - Back to dashboard

---

### 5. **INSURANCE FLOW**

#### Insurance Activation (Component: ✅ `InsuranceActivation.tsx`)
- Automatic funeral cover details
- Beneficiary form (max 4)
- Health acknowledgment
- Submit → Policy created

#### Insurance Dashboard/Policies Page ❌ MISSING
- **My Policies View**
  - Active policies list
  - Policy details cards
  - Coverage amounts
  - Beneficiaries
  - Policy documents

- **Individual Policy Page** ❌ MISSING
  - Full policy details
  - Edit beneficiaries
  - Download policy document
  - Claims history
  - Make a claim button

#### Insurance Claims ❌ MISSING
- **File Claim Page**
  - Claim type
  - Incident details
  - Supporting documents upload
  - Submit claim

- **Claims History Page**
  - List of past claims
  - Claim status
  - Claim details

---

### 6. **ACCOUNT MANAGEMENT**

#### Account Settings Page ❌ MISSING
- **Profile Tab**
  - Edit: Name, Email, Phone, DOB
  - Country
  - Profile photo
  - Change password

- **Subscription Tab**
  - Current plan details
  - Payment history
  - Change plan button
  - Cancel subscription
  - Renewal settings

- **Notifications Tab**
  - Email preferences
  - SMS preferences
  - Push notifications

- **Privacy & Security Tab**
  - Two-factor authentication
  - Login history
  - Connected devices
  - Delete account

#### Subscription Management Page ❌ MISSING
- **Current Subscription**
  - Tier name
  - Next billing date
  - Payment method
  - Upgrade/Downgrade options

- **Change Plan Modal**
  - Select new tier
  - Price comparison
  - Prorated billing info
  - Confirm change

- **Cancel Subscription Modal**
  - Reason for canceling
  - Feedback
  - Retain/Offer discount
  - Final confirmation

---

### 7. **SUPPORT & HELP**

#### Help Center ❌ MISSING
- **FAQ Page**
  - Common questions
  - Search functionality
  - Categories

- **Contact Support Page**
  - Support form
  - Email
  - Phone numbers
  - Live chat (if available)

- **Ticket System** ❌ MISSING
  - Create ticket
  - View tickets
  - Ticket details
  - Message history

---

### 8. **NOTIFICATIONS & ALERTS**

#### Notifications Page ❌ MISSING
- All notifications list
- Mark as read
- Filter by type
- Delete notifications

#### Notification Types:
- Course enrollment
- Lesson completion
- Payment receipt
- Subscription renewal
- Insurance policy updates
- System announcements

---

### 9. **PAYMENTS & BILLING**

#### Payment History Page ❌ MISSING
- List of all transactions
- Invoice downloads
- Payment status
- Refund requests

#### Billing Information ❌ MISSING
- Saved payment methods
- Add/remove cards
- Set default payment
- Billing address

---

### 10. **ADMIN/INSTRUCTOR FEATURES** (Future)

#### Instructor Dashboard ❌ NOT YET NEEDED
- Course management
- Student analytics
- Content upload
- Grading

---

## COMPONENT INVENTORY

### ✅ Existing Components (7)
1. `LoginForm.tsx` - User login
2. `RegisterForm.tsx` - User registration
3. `PricingTiers.tsx` - Subscription plans
4. `StudentDashboard.tsx` - Main dashboard
5. `CourseCatalog.tsx` - Browse courses
6. `InsuranceActivation.tsx` - Activate funeral cover
7. `PageURLChecker.tsx` - Utility component

### ❌ Missing Critical Components (20+)

#### Authentication (3)
1. `ForgotPassword.tsx` - Password reset request
2. `ResetPassword.tsx` - Password reset form
3. `ActivateLicense.tsx` - License activation

#### Courses (4)
4. `CourseDetail.tsx` - Individual course page
5. `CoursePlayer.tsx` - Video player & lesson viewer
6. `EnrollmentModal.tsx` - Confirm enrollment
7. `CourseProgress.tsx` - Track progress

#### Payments (5)
8. `PaymentMethodSelector.tsx` - Choose payment type
9. `PaymentForm.tsx` - Enter payment details
10. `PaymentProcessing.tsx` - Processing state
11. `PaymentSuccess.tsx` - Success confirmation
12. `PaymentFailed.tsx` - Error handling

#### Insurance (3)
13. `InsurancePolicies.tsx` - List all policies
14. `PolicyDetail.tsx` - Individual policy view
15. `FileClaim.tsx` - Claims submission

#### Account (5)
16. `AccountSettings.tsx` - User settings hub
17. `ProfileSettings.tsx` - Edit profile
18. `SubscriptionSettings.tsx` - Manage subscription
19. `NotificationSettings.tsx` - Notification preferences
20. `SecuritySettings.tsx` - Password, 2FA, etc.

#### Support (3)
21. `HelpCenter.tsx` - FAQ and help docs
22. `ContactSupport.tsx` - Support form
23. `SupportTickets.tsx` - Ticket management

#### Other (4)
24. `Notifications.tsx` - Notifications page
25. `PaymentHistory.tsx` - Transaction history
26. `BillingInfo.tsx` - Saved payments
27. `Onboarding.tsx` - First-time user tour

---

## USER FLOW DIAGRAMS

### Primary User Journey
```
Landing Page
    ↓
Register/Login
    ↓
Dashboard (New User)
    ↓
    ├── Choose Subscription → Payment → Success → Dashboard
    ├── Browse Courses → Course Detail → Enroll → Course Player
    └── Activate Insurance → Form → Success → Dashboard

Dashboard (Active User)
    ↓
    ├── My Courses → Course Player → Complete Lessons
    ├── Subscription → Manage Plan → Change/Cancel
    ├── Insurance → View Policies → File Claim
    ├── Account → Settings → Update Profile
    └── Support → Help Center → Contact/Ticket
```

### Payment Flow Detail
```
Pricing Page
    ↓
Select Tier → Click "Start Now"
    ↓
Payment Method Selection
    ↓
    ├── Card → Card Form → Processing → Success/Failed
    ├── Mobile Money → Phone Input → Processing → Success/Failed
    └── Bank Transfer → Instructions → Pending Verification
```

### Course Enrollment Flow
```
Course Catalog
    ↓
Search/Filter → Select Course
    ↓
Course Detail Page
    ↓
Click "Enroll" → Enrollment Modal
    ↓
Confirm → Added to "My Courses"
    ↓
Dashboard → My Courses → Click Course
    ↓
Course Player → Watch Lessons → Mark Complete
    ↓
Course Complete → Certificate (Future)
```

---

## PRIORITY MATRIX

### 🔴 Critical (Must Have) - Phase 1
1. `CourseDetail.tsx` - Can't enroll without it
2. `CoursePlayer.tsx` - Core learning experience
3. `PaymentForm.tsx` - Can't collect payments
4. `PaymentSuccess.tsx` - User confirmation
5. `ForgotPassword.tsx` - Password recovery
6. `AccountSettings.tsx` - Basic profile management

### 🟡 Important (Should Have) - Phase 2
7. `InsurancePolicies.tsx` - View insurance details
8. `PolicyDetail.tsx` - Manage policies
9. `PaymentHistory.tsx` - Transaction records
10. `SubscriptionSettings.tsx` - Manage plans
11. `NotificationSettings.tsx` - User preferences
12. `HelpCenter.tsx` - Self-service support

### 🟢 Nice to Have - Phase 3
13. `Onboarding.tsx` - Improve first-time UX
14. `FileClaim.tsx` - Insurance claims
15. `SupportTickets.tsx` - Advanced support
16. `Notifications.tsx` - Notification center
17. `EnrollmentModal.tsx` - Better enrollment UX

---

## FRAMER PAGE REQUIREMENTS

### Pages Needed in Framer

1. **`/`** - Landing page (Hero, Features, CTA)
2. **`/login`** - Login form page
3. **`/register`** - Registration form page
4. **`/forgot-password`** ❌ MISSING
5. **`/reset-password`** ❌ MISSING
6. **`/activate`** ❌ MISSING - License activation
7. **`/dashboard`** - Student dashboard
8. **`/pricing`** - Pricing tiers
9. **`/courses`** - Course catalog
10. **`/courses/[id]`** ❌ MISSING - Individual course
11. **`/courses/[id]/learn`** ❌ MISSING - Course player
12. **`/payment`** ❌ MISSING - Payment flow
13. **`/payment/success`** ❌ MISSING
14. **`/payment/failed`** ❌ MISSING
15. **`/insurance/activate`** - Insurance activation
16. **`/insurance/policies`** ❌ MISSING
17. **`/insurance/policies/[id]`** ❌ MISSING
18. **`/insurance/claim`** ❌ MISSING
19. **`/account/settings`** ❌ MISSING
20. **`/account/subscription`** ❌ MISSING
21. **`/account/billing`** ❌ MISSING
22. **`/support`** ❌ MISSING
23. **`/support/tickets`** ❌ MISSING
24. **`/notifications`** ❌ MISSING

---

## NEXT STEPS

### Immediate Actions:
1. **Build Payment Flow Components** (Critical for revenue)
   - PaymentForm.tsx
   - PaymentSuccess.tsx
   - PaymentFailed.tsx

2. **Build Course Detail & Player** (Critical for learning)
   - CourseDetail.tsx
   - CoursePlayer.tsx

3. **Build Account Management** (User retention)
   - AccountSettings.tsx
   - SubscriptionSettings.tsx

4. **Build Password Recovery** (User support)
   - ForgotPassword.tsx
   - ResetPassword.tsx

### Decision Points:
- **Payment Gateway Integration**: Which provider? (Stripe, PayFast, DPO?)
- **Video Hosting**: Where are videos stored? (Vimeo, Wistia, AWS S3?)
- **Course Content Structure**: How is curriculum data structured in backend?
- **Insurance Claims**: Digital submission or manual process?

---

## API ENDPOINTS NEEDED

Based on this flow, these API endpoints should exist:

### Authentication
- ✅ POST `/auth/register`
- ✅ POST `/auth/login`
- ❌ POST `/auth/forgot-password`
- ❌ POST `/auth/reset-password`
- ❌ POST `/auth/activate-license`

### Courses
- ✅ GET `/courses` (list all)
- ❌ GET `/courses/:id` (single course)
- ❌ POST `/courses/:id/enroll`
- ❌ GET `/courses/:id/lessons`
- ❌ GET `/courses/:id/lessons/:lessonId`
- ❌ POST `/courses/:id/progress`

### Subscriptions
- ✅ GET `/subscriptions/tiers`
- ✅ POST `/subscriptions/subscribe`
- ❌ GET `/subscriptions/my-subscription`
- ❌ PUT `/subscriptions/change-plan`
- ❌ DELETE `/subscriptions/cancel`

### Payments
- ❌ POST `/payments/create-payment-intent`
- ❌ POST `/payments/process-payment`
- ❌ GET `/payments/history`
- ❌ POST `/payments/refund`

### Insurance
- ✅ POST `/insurance/policies` (create)
- ❌ GET `/insurance/policies` (list)
- ❌ GET `/insurance/policies/:id`
- ❌ PUT `/insurance/policies/:id/beneficiaries`
- ❌ POST `/insurance/claims`

### User Account
- ✅ GET `/users/me`
- ❌ PUT `/users/me`
- ❌ PUT `/users/me/password`
- ❌ GET `/users/me/notifications`
- ❌ PUT `/users/me/settings`

---

**Total Components Needed: ~30**
**Currently Built: 7 (23%)**
**Remaining: 23 (77%)**

This analysis provides a clear roadmap for completing the Masheleng University platform.
