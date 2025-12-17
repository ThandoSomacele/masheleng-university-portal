# Masheleng University Design System

**Version:** 1.0.0
**Last Updated:** December 2025
**Status:** Active

This design system ensures visual consistency across all Masheleng University components and interfaces.

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-blue: #0066FF;        /* Main brand color - buttons, links, accents */
--primary-blue-hover: #0052CC;  /* Hover state for primary blue */
--primary-blue-light: #3385FF;  /* Light variant */
```

### Background Colors
```css
--bg-primary: #0A0A0A;          /* Main background (very dark) */
--bg-secondary: #1A1A1A;        /* Card/section backgrounds */
--bg-tertiary: #2A2A2A;         /* Elevated elements, inputs */
--bg-hover: #333333;            /* Hover states */
```

### Text Colors
```css
--text-primary: #FFFFFF;        /* Primary text, headings */
--text-secondary: #999999;      /* Secondary text, descriptions */
--text-muted: #666666;          /* Muted text, labels */
--text-disabled: #4D4D4D;       /* Disabled state */
```

### Semantic Colors
```css
--success: #22C55E;             /* Success states, ratings */
--success-bg: #E6F4EA;          /* Success background */
--error: #EF4444;               /* Error states */
--error-bg: #FEE;               /* Error background */
--warning: #F59E0B;             /* Warning states */
--info: #3B82F6;                /* Info states */
```

### Border Colors
```css
--border-primary: #333333;      /* Default borders */
--border-secondary: #404040;    /* Subtle borders */
--border-focus: #0066FF;        /* Focus state borders */
```

---

## 📝 Typography

### Font Family
```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
```css
--font-size-xs: 12px;           /* Small labels, captions */
--font-size-sm: 14px;           /* Secondary text, buttons */
--font-size-base: 16px;         /* Body text */
--font-size-lg: 18px;           /* Large body text */
--font-size-xl: 20px;           /* Section headings */
--font-size-2xl: 24px;          /* Card titles */
--font-size-3xl: 28px;          /* Page titles */
--font-size-4xl: 32px;          /* Hero headings */
--font-size-5xl: 40px;          /* Display headings */
```

### Font Weights
```css
--font-weight-normal: 400;      /* Regular text */
--font-weight-medium: 500;      /* Slightly emphasized */
--font-weight-semibold: 600;    /* Buttons, labels */
--font-weight-bold: 700;        /* Headings, important text */
```

### Line Heights
```css
--line-height-tight: 1.2;       /* Headings */
--line-height-normal: 1.5;      /* Body text */
--line-height-relaxed: 1.8;     /* Long-form content */
```

---

## 📏 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

**Usage:**
- Padding: Use for internal spacing within components
- Margin: Use for spacing between components
- Gap: Use for spacing in flex/grid layouts

---

## 🔲 Border Radius

```css
--radius-sm: 6px;               /* Small elements */
--radius-md: 8px;               /* Buttons, inputs */
--radius-lg: 12px;              /* Cards, modals */
--radius-xl: 16px;              /* Large cards */
--radius-full: 9999px;          /* Circular/pill shapes */
```

---

## 🖼️ Component Styles

### Buttons

#### Primary Button
```javascript
{
  backgroundColor: "#0066FF",
  color: "#FFFFFF",
  padding: "14px 24px",
  fontSize: "16px",
  fontWeight: "600",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
}
// Hover: backgroundColor: "#0052CC"
// Disabled: backgroundColor: "#4D4D4D", cursor: "not-allowed"
```

#### Secondary Button
```javascript
{
  backgroundColor: "transparent",
  color: "#0066FF",
  padding: "14px 24px",
  fontSize: "16px",
  fontWeight: "600",
  borderRadius: "8px",
  border: "1px solid #0066FF",
  cursor: "pointer",
  transition: "all 0.2s ease",
}
// Hover: backgroundColor: "rgba(0, 102, 255, 0.1)"
```

### Cards

#### Standard Card
```javascript
{
  backgroundColor: "#1A1A1A",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #333333",
  transition: "all 0.2s ease",
}
// Hover: border: "1px solid #404040", transform: "translateY(-2px)"
```

#### Course Card
```javascript
{
  backgroundColor: "#1A1A1A",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #333333",
  transition: "all 0.2s ease",
}
// Structure:
// - Image (16:9 aspect ratio)
// - Badge overlay (top-left corner)
// - Content padding: 20px
// - Star rating + price row
// - Title (bold, 20px)
// - Instructor info
// - Description (muted text)
// - Footer with icons (duration, lessons)
// - CTA button (full width)
```

#### Pricing Card
```javascript
{
  backgroundColor: "#1A1A1A",
  borderRadius: "12px",
  padding: "32px 24px",
  border: "1px solid #333333",
  textAlign: "center",
}
// Structure:
// - Tier label (BASIC/PRO/PREMIUM)
// - Price (large, bold)
// - Feature list (left-aligned)
// - CTA button at bottom
```

### Forms

#### Input Field
```javascript
{
  backgroundColor: "#2A2A2A",
  color: "#FFFFFF",
  padding: "12px 16px",
  fontSize: "16px",
  fontWeight: "400",
  border: "1px solid #404040",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.2s ease",
}
// Focus: border: "1px solid #0066FF"
// Error: border: "1px solid #EF4444"
```

#### Label
```javascript
{
  color: "#999999",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "8px",
  display: "block",
}
```

### Badges

#### Status Badge
```javascript
{
  display: "inline-block",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "600",
  borderRadius: "20px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}
// Variants:
// Success: backgroundColor: "#E6F4EA", color: "#1E8E3E"
// Warning: backgroundColor: "#FFF3CD", color: "#856404"
// Info: backgroundColor: "#E3F2FD", color: "#1976D2"
```

#### Course Category Badge
```javascript
{
  position: "absolute",
  top: "12px",
  left: "12px",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "#FFFFFF",
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "600",
  borderRadius: "6px",
  backdropFilter: "blur(4px)",
}
```

### Icons & Ratings

#### Star Rating
```javascript
{
  display: "flex",
  alignItems: "center",
  gap: "4px",
}
// Star: color: "#F59E0B" (filled), color: "#404040" (empty)
// Text: color: "#999999", fontSize: "14px"
```

---

## 🎯 Layout Patterns

### Container Widths
```css
--container-sm: 640px;          /* Small content */
--container-md: 768px;          /* Medium content */
--container-lg: 1024px;         /* Standard page width */
--container-xl: 1280px;         /* Wide layouts */
--container-2xl: 1536px;        /* Maximum width */
```

### Grid Layouts

#### Course Grid
```javascript
{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "24px",
}
// Mobile: minmax(280px, 1fr)
// Tablet: minmax(300px, 1fr)
// Desktop: minmax(320px, 1fr)
```

#### Pricing Grid
```javascript
{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  maxWidth: "1000px",
  margin: "0 auto",
}
```

---

## 🌓 Shadows & Effects

### Box Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
```

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

---

## 📱 Responsive Breakpoints

```css
--breakpoint-sm: 640px;         /* Mobile landscape */
--breakpoint-md: 768px;         /* Tablet portrait */
--breakpoint-lg: 1024px;        /* Tablet landscape / small desktop */
--breakpoint-xl: 1280px;        /* Desktop */
--breakpoint-2xl: 1536px;       /* Large desktop */
```

---

## ♿ Accessibility

### Focus States
- All interactive elements must have visible focus states
- Focus ring: `2px solid #0066FF` with `2px offset`

### Color Contrast
- Text on dark background: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio

### Touch Targets
- Minimum size: 44x44px for mobile
- Recommended: 48x48px

---

## 🧩 Component Library

### Logo
- Primary: Blue version on dark background
- Size: 120-150px width for headers
- SVG format for scalability

### Navigation
```javascript
{
  backgroundColor: "#0A0A0A",
  borderBottom: "1px solid #333333",
  padding: "16px 24px",
}
// Links: color: "#999999", hover: color: "#FFFFFF"
// Active: color: "#0066FF"
```

### Footer
```javascript
{
  backgroundColor: "#0A0A0A",
  borderTop: "1px solid #333333",
  padding: "48px 24px",
  color: "#999999",
}
```

---

## 📋 Usage Examples

### Login Form Implementation
```javascript
const loginFormStyles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: "12px",
    padding: "40px",
    border: "1px solid #333333",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#999999",
    marginBottom: "32px",
    lineHeight: "1.5",
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #404040",
    borderRadius: "8px",
    width: "100%",
    marginBottom: "16px",
  },
  button: {
    backgroundColor: "#0066FF",
    color: "#FFFFFF",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    width: "100%",
    border: "none",
    cursor: "pointer",
  },
}
```

### Course Card Implementation
```javascript
const courseCardStyles = {
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #333333",
  },
  imageContainer: {
    position: "relative",
    aspectRatio: "16/9",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FFFFFF",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "6px",
  },
  content: {
    padding: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "12px",
  },
  description: {
    fontSize: "14px",
    color: "#999999",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  button: {
    backgroundColor: "#0066FF",
    color: "#FFFFFF",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "8px",
    width: "100%",
    border: "none",
    cursor: "pointer",
  },
}
```

---

## 🔄 Version History

### v1.0.0 (December 2025)
- Initial design system created
- Core color palette defined
- Component library established
- Typography system standardized

---

## 📞 Support

For questions or suggestions about the design system:
- Check component examples in `/framer-integration/components/`
- Review design files in `/Users/thando/Desktop/Masheleng Designs/`
- Consult with the design team

---

**Remember:** Consistency is key. Always use these design tokens and patterns to maintain a cohesive user experience across all Masheleng University interfaces.
