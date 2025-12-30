# Masheleng University Design System

## Component Style Guide for Framer Integration

**Version:** 1.0.0
**Last Updated:** December 29, 2025
**Based on:** Production design screenshots (December 17, 2025)

---

## 🎨 Color Palette

### Primary Colors

```css
--bg-primary: #1a1a1a /* Main dark background */ --bg-secondary: #252525 /* Card/container background */
  --bg-tertiary: #2a2a2a /* Input fields, subtle sections */ --brand-blue: #0066ff
  /* Primary action color (buttons, links) */ --brand-blue-hover: #0052cc /* Hover state for blue elements */
  --brand-blue-light: #3385ff /* Lighter blue for highlights */ --text-primary: #ffffff /* Main text */
  --text-secondary: #a0a0a0 /* Secondary text, labels */ --text-muted: #707070 /* Disabled, placeholder text */
  --border-subtle: #333333 /* Subtle borders */ --border-medium: #404040 /* Default borders */ --border-light: #505050
  /* Hover/focus borders */;
```

### Semantic Colors

```css
--success: #4caf50 /* Success states, checkmarks */ --success-bg: #1b5e20 /* Success background */ --error: #f44336
  /* Error states */ --error-bg: #b71c1c /* Error background */ --warning: #ff9800 /* Warning states */
  --warning-bg: #e65100 /* Warning background */ --info: #2196f3 /* Info states */ --info-bg: #0d47a1
  /* Info background */;
```

---

## Component Checklist

Every component must include:

- [ ] Import `API_URL` from `./config.js`
- [ ] JSDoc comment with "Matches Masheleng Design System"
- [ ] Dark theme (#1A1A1A background, #0066FF blue)
- [ ] Token key: `'masheleng_token'` in localStorage
