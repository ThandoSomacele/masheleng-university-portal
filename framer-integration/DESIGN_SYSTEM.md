# Masheleng University Design System
## Component Style Guide for Framer Integration

**Version:** 1.0.0
**Last Updated:** December 29, 2025
**Based on:** Production design screenshots (December 17, 2025)

---

## 🎨 Color Palette

### Primary Colors
```css
--bg-primary: #1A1A1A          /* Main dark background */
--bg-secondary: #252525        /* Card/container background */
--bg-tertiary: #2A2A2A         /* Input fields, subtle sections */

--brand-blue: #0066FF          /* Primary action color (buttons, links) */
--brand-blue-hover: #0052CC    /* Hover state for blue elements */
--brand-blue-light: #3385FF    /* Lighter blue for highlights */

--text-primary: #FFFFFF        /* Main text */
--text-secondary: #A0A0A0      /* Secondary text, labels */
--text-muted: #707070          /* Disabled, placeholder text */

--border-subtle: #333333       /* Subtle borders */
--border-medium: #404040       /* Default borders */
--border-light: #505050        /* Hover/focus borders */
```

### Semantic Colors
```css
--success: #4CAF50            /* Success states, checkmarks */
--success-bg: #1B5E20         /* Success background */

--error: #F44336              /* Error states */
--error-bg: #B71C1C           /* Error background */

--warning: #FF9800            /* Warning states */
--warning-bg: #E65100         /* Warning background */

--info: #2196F3               /* Info states */
--info-bg: #0D47A1            /* Info background */
```

---

## Component Checklist

Every component must include:

- [ ] Import `API_URL` from `../config.js`
- [ ] JSDoc comment with "Matches Masheleng Design System"
- [ ] Dark theme (#1A1A1A background, #0066FF blue)
- [ ] Token key: `'masheleng_token'` in localStorage

