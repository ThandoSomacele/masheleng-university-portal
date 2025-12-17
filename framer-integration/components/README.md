# Framer Code Components

All components are ready to copy-paste into your Framer project.

## How to Use These Components

1. In Framer: **Insert → Code → Code Component**
2. Name the component (use the name in the filename)
3. Copy the entire code from the file and paste it
4. The component will appear in your component library

## Available Components

### 1. PricingTiers.tsx
**Purpose:** Display subscription pricing cards on landing page
**Endpoint:** `GET /api/v1/subscriptions/tiers` (public)
**Features:**
- Fetches and displays all subscription tiers
- Shows pricing in BWP
- Displays tier features and benefits
- CTA buttons for subscription

### 2. LoginForm.tsx
**Purpose:** User authentication page
**Endpoint:** `POST /api/v1/auth/login`
**Features:**
- Email/password form
- Error handling
- Auto-redirect to dashboard on success
- Token storage in localStorage

### 3. RegisterForm.tsx
**Purpose:** User registration page
**Endpoint:** `POST /api/v1/auth/register`
**Features:**
- Complete registration form
- Country selection (BW/ZA)
- Password validation
- Auto-login after signup

### 4. CourseCatalog.tsx
**Purpose:** Browse and enroll in courses
**Endpoints:**
- `GET /api/v1/courses` (public)
- `POST /api/v1/courses/:id/enroll` (auth required)
**Features:**
- Lists all published courses
- Shows tier requirements
- Enrollment functionality
- Authentication check

### 5. StudentDashboard.tsx
**Purpose:** User dashboard showing all account info
**Endpoints:**
- `GET /api/v1/auth/me`
- `GET /api/v1/subscriptions/my-subscription`
- `GET /api/v1/courses/enrollments/my`
- `GET /api/v1/payments`
**Features:**
- User profile display
- Subscription status
- Enrolled courses with progress
- Payment history
- Logout functionality

## Component Customization

All components use inline styles for easy customization. You can:

1. **Modify styles:** Edit the `styles` object at the bottom of each file
2. **Change colors:** Update backgroundColor, color values
3. **Adjust layout:** Modify grid templates, padding, spacing
4. **Add features:** Components are well-structured for extensions

## Testing Components

Use the provided `APITest.tsx` component first to verify your API connection works before implementing the main components.

## Need Help?

- Check the main README.md for setup instructions
- Review the Troubleshooting section for common issues
- Refer to the API client documentation for available methods
