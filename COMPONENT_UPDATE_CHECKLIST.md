# Component Update Checklist

## What Changed & How to Use

---

## ✅ All Payment Components Updated

### Quick Visual Reference

#### OLD DESIGN (Light Theme)

```
┌─────────────────────────────────┐
│  Light gray background #f5f5f5  │
│  ┌───────────────────────────┐  │
│  │   White Card #fff         │  │
│  │   Black text #1a1a1a      │  │
│  │   ┌─────────────────┐     │  │
│  │   │ Green Button    │     │  │
│  │   │   #4CAF50       │     │  │
│  │   └─────────────────┘     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### NEW DESIGN (Masheleng Dark Theme)

```
┌─────────────────────────────────┐
│  Dark background #1A1A1A        │
│  ┌───────────────────────────┐  │
│  │   Dark Card #252525       │  │
│  │   White text #FFFFFF      │  │
│  │   ┌─────────────────┐     │  │
│  │   │  Blue Button    │     │  │
│  │   │   #0066FF       │     │  │
│  │   └─────────────────┘     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🎨 Color Changes Summary

| Element         | Old Color | New Color | Notes               |
| --------------- | --------- | --------- | ------------------- |
| Background      | `#f5f5f5` | `#1A1A1A` | Dark background     |
| Cards           | `#fff`    | `#252525` | Subtle dark cards   |
| Primary Button  | `#4CAF50` | `#0066FF` | **Masheleng blue!** |
| Heading Text    | `#1a1a1a` | `#FFFFFF` | White for contrast  |
| Body Text       | `#333`    | `#FFFFFF` | White primary text  |
| Secondary Text  | `#666`    | `#A0A0A0` | Light gray          |
| Borders         | `#e0e0e0` | `#333333` | Subtle dark borders |
| Inputs          | `#fff`    | `#2A2A2A` | Dark input fields   |
| Input Borders   | `#e0e0e0` | `#404040` | Dark borders        |
| Selected State  | `#f1f8f4` | `#252525` | Dark selected       |
| Selected Border | `#4CAF50` | `#0066FF` | **Blue accent!**    |

---

## 📋 Component-by-Component Checklist

### PaymentMethodSelector ✅

**What Changed:**

- [x] Dark background (#1A1A1A)
- [x] Dark method cards (#252525)
- [x] Blue selection border (#0066FF)
- [x] Blue radio dots when selected
- [x] White card text
- [x] Orange "Popular" badges
- [x] Dark security notice

**How to Use:**

```tsx
<PaymentMethodSelector onMethodSelect={method => handleSelect(method)} selectedMethod='card' />
```

**Visual:** Dark cards that glow blue when selected

---

### PaymentForm ✅

**What Changed:**

- [x] Imports `API_URL` from config (no hardcoded URL!)
- [x] Dark form background
- [x] Dark input fields (#2A2A2A)
- [x] Blue submit button with shadow
- [x] Blue info boxes
- [x] White labels and text

**How to Use:**

```tsx
<PaymentForm
  subscriptionId='uuid'
  amount={150}
  currency='BWP'
  paymentMethod='card'
  onSuccess={payment => console.log(payment)}
/>
```

**Key Benefit:** Updates to API URL only need to happen in `config.js`

---

### PaymentSuccess ✅

**What Changed:**

- [x] Dark page background
- [x] Dark success card
- [x] Green checkmark (semantic color kept)
- [x] Dark detail boxes
- [x] White text throughout
- [x] Blue "Continue" button

**How to Use:**

```tsx
<PaymentSuccess paymentId='uuid' amount={150} currency='BWP' onContinue={() => navigate('/dashboard')} />
```

**Visual:** Clean, dark success page with green checkmark

---

### PaymentFailed ✅

**What Changed:**

- [x] Dark background
- [x] Red error icon (semantic color kept)
- [x] Orange warning boxes
- [x] Dark detail cards
- [x] Gray/blue action buttons
- [x] White text

**How to Use:**

```tsx
<PaymentFailed errorMessage='Insufficient funds' amount={150} currency='BWP' onRetry={() => retryPayment()} />
```

**Visual:** Dark error page with orange warnings

---

### PaymentWorkflow ✅

**What Changed:**

- [x] Dark header
- [x] Blue progress indicators
- [x] Dark step backgrounds
- [x] Blue "Continue" button
- [x] Consistent dark theme

**How to Use:**

```tsx
<PaymentWorkflow
  subscriptionId='uuid'
  amount={150}
  currency='BWP'
  tierName='Entry Tier'
  onComplete={() => navigate('/dashboard')}
/>
```

**Visual:** Dark themed multi-step payment flow

---

## 🔧 Technical Updates

### 1. API Configuration (IMPORTANT!)

**Before:**

```typescript
// In PaymentForm.tsx
const API_URL = 'https://old-url.ngrok-free.app/api/v1';
```

**After:**

```typescript
// In PaymentForm.tsx
import { API_URL } from './config.js';

// In config.js (single source of truth)
const DEV_API_URL = 'https://1bde3222dd89.ngrok-free.app/api/v1';
```

**Benefit:** Change ngrok URL once in `config.js`, all components update!

---

### 2. Design System Comments

All components now have:

```typescript
/**
 * ComponentName - Matches Masheleng Design System
 * Based on design: Dark theme with blue accent (#0066FF)
 * ...
 */
```

---

## 🎯 Design System Quick Reference

### Masheleng Brand Colors

```css
/* Primary */
--brand-blue: #0066ff /* Use for primary actions */ --background: #1a1a1a /* Main dark background */ --card-bg: #252525
  /* Card backgrounds */ /* Text */ --text-primary: #ffffff /* Headings, important text */ --text-secondary: #a0a0a0
  /* Secondary text, labels */ --text-muted: #707070 /* Disabled text */ /* UI Elements */ --border: #333333
  /* Subtle borders */ --input-bg: #2a2a2a /* Input fields */ --input-border: #404040 /* Input borders */ /* Semantic */
  --success: #4caf50 /* Success states */ --error: #f44336 /* Error states */ --warning: #ff9800 /* Warning states */;
```

---

## 📱 Testing Checklist

Before going live, test:

### Visual Testing

- [ ] All components display with dark theme
- [ ] Text is readable (good contrast)
- [ ] Buttons are blue (#0066FF)
- [ ] Cards are dark (#252525)
- [ ] Borders are subtle
- [ ] No light theme remnants

### Functional Testing

- [ ] Payment method selection works
- [ ] Form submission works
- [ ] Success page displays correctly
- [ ] Error page displays correctly
- [ ] Workflow navigation works
- [ ] API calls use correct URL

### Responsive Testing

- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1024px+)

### Browser Testing

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## 🚀 Deployment Steps

1. **Update Framer:**
   - Copy updated component code
   - Paste into Framer code components
   - Republish

2. **Verify config.js:**
   - Ensure `DEV_API_URL` is correct
   - Update when ngrok restarts

3. **Test Payment Flow:**
   - Select method → Form → Success/Failed

4. **Monitor:**
   - Check browser console for errors
   - Test with real API

---

## 💡 Pro Tips

1. **Single Source API URL:**
   - Only edit `config.js` when ngrok changes
   - Never hardcode URLs in components

2. **Design Consistency:**
   - Use #0066FF for all primary actions
   - Use #1A1A1A for all backgrounds
   - Use #FFFFFF for all primary text

3. **Semantic Colors:**
   - Green (#4CAF50) = Success only
   - Red (#F44336) = Errors only
   - Orange (#FF9800) = Warnings/highlights
   - Blue (#0066FF) = Primary actions

4. **Component Reuse:**
   - All components follow same pattern
   - Easy to customize
   - Inline styles for Framer compatibility

---

## 📚 Documentation

- **Design System:** `DESIGN_SYSTEM.md`
- **Update Summary:** `DESIGN_SYSTEM_UPDATE.md`
- **This Checklist:** `COMPONENT_UPDATE_CHECKLIST.md`
- **Test Plans:** `E2E_TEST_PLAN.md`, `QUICK_TEST_GUIDE.md`
- **Frontend Setup:** `FRONTEND_TEST_SETUP.md`

---

**Last Updated:** December 29, 2025
**Commit:** 3cd4075
**Status:** ✅ Ready for Integration
