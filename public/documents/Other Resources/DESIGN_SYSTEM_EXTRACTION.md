# Reno-Sparks Tenants Union Design System
*Extracted from foundation HTML files for Next.js implementation*

## Core Brand Colors

```css
/* Primary Brand Colors */
--primary: #cc0000;        /* Red - main brand color */
--secondary: #7a0000;      /* Dark red - secondary brand */
--base: #ffffff;           /* White - background */
--contrast: #000000;       /* Black - text */
--neutral: #eeeeee;        /* Light gray - borders/subtle elements */

/* Extended Color Palette */
--vivid-red: #cf2e2e;
--luminous-vivid-orange: #ff6900;
--luminous-vivid-amber: #fcb900;
--vivid-green-cyan: #00d084;
--vivid-cyan-blue: #0693e3;
--vivid-purple: #9b51e0;
```

## Typography System

```css
/* Font Families */
--font-primary: "Outfit", sans-serif;           /* Body text */
--font-heading: "League Spartan";               /* Headlines */
--font-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Font Sizes (Responsive) */
--font-size-xs: 16px;
--font-size-small: 18px;
--font-size-medium: clamp(18px, 1.125rem + ((1vw - 3.2px) * 0.227), 20px);
--font-size-large: clamp(20px, 1.25rem + ((1vw - 3.2px) * 0.455), 24px);
--font-size-xl: clamp(24px, 1.5rem + ((1vw - 3.2px) * 0.682), 30px);
--font-size-max-36: clamp(30px, 1.875rem + ((1vw - 3.2px) * 0.682), 36px);
--font-size-max-48: clamp(36px, 2.25rem + ((1vw - 3.2px) * 1.364), 48px);
--font-size-max-60: clamp(42px, 2.625rem + ((1vw - 3.2px) * 2.045), 60px);
--font-size-max-72: clamp(48px, 3rem + ((1vw - 3.2px) * 2.727), 72px);

/* Font Weights */
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;

/* Line Heights */
--line-height-body: 1.75;
--line-height-heading: 1.1;
--line-height-medium: 1.5;
```

## Spacing System

```css
/* Spacing Scale */
--spacing-xs: 20px;
--spacing-sm: clamp(30px, 4vw, 40px);
--spacing-md: clamp(40px, 6vw, 60px);
--spacing-lg: clamp(50px, 8vw, 80px);
--spacing-xl: clamp(60px, 10vw, 100px);

/* Consistent Gap */
--gap: 30px;

/* Layout Constraints */
--content-size: 640px;      /* Main content width */
--wide-size: 1200px;        /* Wide content width */
```

## Component Styles

### Buttons
```css
.wp-element-button {
  background-color: var(--primary);
  border-radius: 5px;
  border: none;
  color: var(--base);
  font-size: 16px;
  font-weight: 400;
  padding: 15px 30px;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}
```

### Navigation
```css
.wp-block-navigation {
  font-size: 18px;
}

.wp-block-navigation a {
  text-decoration: none;
}

.wp-block-navigation .wp-block-navigation__submenu-container a {
  padding: 2px 10px;
}
```

### Layout Containers
```css
.is-layout-constrained {
  max-width: var(--content-size);
  margin-left: auto;
  margin-right: auto;
}

.alignwide {
  max-width: var(--wide-size);
}

.alignfull {
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
}
```

## Responsive Design

### Breakpoints
- Mobile: max-width: 600px
- Tablet: max-width: 782px
- Desktop: min-width: 782px

### Mobile Adaptations
```css
@media (max-width: 782px) {
  .is-style-columns-reverse {
    flex-direction: column-reverse;
  }
}

@media (max-width: 600px) {
  /* Mobile-specific overrides */
}
```

## Shadows & Effects

```css
--shadow-natural: 6px 6px 9px rgba(0, 0, 0, 0.2);
--shadow-deep: 12px 12px 50px rgba(0, 0, 0, 0.4);
--shadow-sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);
--shadow-light: 0 0 50px rgb(10, 10, 10, 0.1);
--shadow-solid: 5px 5px 0 rgb(10, 10, 10, 1);
```

## Page Structure Elements

### Header/Navigation Areas
- Site title: Large font size (var(--font-size-large))
- Navigation: Small font size (18px), right-aligned
- Logo/branding: League Spartan font family

### Content Areas
- Main content: max-width 640px, centered
- Wide content: max-width 1200px
- Full-width: 100vw with negative margins

### Footer
- Background: Dark (contrast color)
- Text: Light (base color)
- Links: No underlines in navigation context

## Implementation Notes for Next.js + Tailwind

1. **Font Loading**: Use `next/font` for Outfit and League Spartan
2. **Color Variables**: Convert to Tailwind CSS custom properties
3. **Responsive Typography**: Implement clamp() functions in Tailwind config
4. **Layout Components**: Create reusable container components
5. **Button Variants**: Implement primary/secondary button styles
6. **Navigation**: Responsive mobile menu with hamburger toggle