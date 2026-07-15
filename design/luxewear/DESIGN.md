---
name: LuxeWear
colors:
  surface: '#FFFFFF'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f4'
  surface-container: '#f0edee'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e5e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464c'
  inverse-surface: '#303031'
  inverse-on-surface: '#f3f0f1'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261906'
  on-tertiary-container: '#968065'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#f9debf'
  tertiary-fixed-dim: '#dcc2a4'
  on-tertiary-fixed: '#261906'
  on-tertiary-fixed-variant: '#55442d'
  background: '#FAFAF9'
  on-background: '#1b1b1d'
  surface-variant: '#e5e2e3'
  luxury-gold: '#D4AF37'
  text-primary: '#18181B'
  text-secondary: '#52525B'
  border: '#E4E4E7'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-desktop: 2rem
  margin-mobile: 1rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 1rem
  unit-lg: 1.5rem
  unit-xl: 2.5rem
---

# Design System: LuxeWear E-commerce

This design system is tailored for a high-end, impactful clothing e-commerce platform, utilizing a sophisticated palette of deep grays, crisp whites, and vibrant accent greens.

## Colors

### Brand Colors
- **Primary:** `#111827` (Deep Charcoal) - Used for headers, primary buttons, and strong text.
- **Accent:** `#16A34A` (Forest Green) - Used for CTAs, success states, and key highlights.
- **Gold:** `#D4AF37` (Luxury Highlight) - Used for premium badges and elegant touches.

### UI Colors
- **Background:** `#FAFAF9` (Off-white)
- **Surface:** `#FFFFFF` (Pure white)
- **Text Primary:** `#18181B` (Near black)
- **Text Secondary:** `#52525B` (Medium gray)
- **Border:** `#E4E4E7` (Light gray)

## Typography
- **Headings:** Sans-serif, bold, tight tracking.
- **Body:** Sans-serif, regular, 1.5 line height for readability.

## Components

### Buttons
- **Primary:** Background: `--primary`, Text: `--text-white`, Radius: `6px`.
- **Accent:** Background: `--accent`, Text: `--text-white`, Radius: `6px`.

### Cards
- **Product Card:** White background, subtle shadow (`--shadow-sm`), smooth hover transition to `--shadow-product`.

### Forms
- **Inputs:** White background, `--border` color, 6px radius, accent green focus state.

## Variables
```css
:root {
  --primary: #111827;
  --primary-hover: #0F172A;
  --accent: #16A34A;
  --accent-hover: #15803D;
  --gold: #D4AF37;
  --background: #FAFAF9;
  --surface: #FFFFFF;
  --text-primary: #18181B;
  --text-secondary: #52525B;
  --border: #E4E4E7;
  --radius-md: 14px;
  --shadow-md: 0 6px 16px rgba(0,0,0,.08);
}
```
