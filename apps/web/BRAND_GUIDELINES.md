# EFFINITY Brand Guidelines

## Brand Overview

EFFINITY is a professional, modern, tech-forward SaaS platform designed for real estate, e-commerce, and legal verticals. Our brand identity reflects efficiency, innovation, and reliability.

## Logo Usage

### Logo Variants

We provide 4 official logo variants:

1. **Full Logo** (`effinity-logo-full.svg`)
   - Logo mark + wordmark
   - Primary usage for headers, marketing materials
   - Minimum width: 120px

2. **Icon Only** (`effinity-logo-icon.svg`)
   - Logo mark without text
   - Usage: Favicons, app icons, small spaces
   - Minimum size: 16px

3. **White Version** (`effinity-logo-white.svg`)
   - For dark backgrounds
   - Usage: Dark mode UI, dark marketing materials

4. **Blue Version** (`effinity-logo-blue.svg`)
   - For light backgrounds
   - Usage: Light mode UI, documentation

### Logo Specifications

- **Format**: SVG (vector) preferred, PNG for raster needs
- **Minimum Size**: 16px (icon only), 120px (full logo)
- **Clear Space**: Minimum 16px padding around logo
- **Alignment**: Center or left-aligned preferred
- **Background**: Sufficient contrast required (WCAG AA minimum)

### Logo Don'ts

- ❌ Do not stretch or distort the logo
- ❌ Do not rotate the logo
- ❌ Do not add drop shadows or effects
- ❌ Do not change logo colors
- ❌ Do not place on low-contrast backgrounds
- ❌ Do not use outdated logo versions

## Color Palette

### Primary Colors

**Royal Blue** - `#2979FF`
- Primary brand color
- Use for: CTAs, links, active states, brand accents
- WCAG AA compliant on white backgrounds

**Deep Navy** - `#0E1A2B`
- Dark background color
- Use for: Dark mode backgrounds, headers, footers
- Premium, professional feel

**Medium Navy** - `#1A2F4B`
- Elevated surface color
- Use for: Cards on dark backgrounds, elevated UI elements

### Secondary Colors

**Light Blue** - `#60A5FA`
- Accent and highlight color
- Use for: Hover states, secondary CTAs, highlights

**Steel Gray** - `#9EA7B3`
- Metallic accent
- Use for: Borders, dividers, muted elements

**Silver Mist** - `#CFD4DD`
- Light metallic
- Use for: Subtle backgrounds, light borders

### Semantic Colors

**Success** - `#10B981` (Green)
**Warning** - `#F59E0B` (Amber)
**Error** - `#EF4444` (Red)
**Info** - `#3B82F6` (Blue)

### Neutral Colors

- Gray 50 to Gray 900 scale
- Use for text, backgrounds, borders
- Maintain WCAG AA contrast ratios

## 60/30/10 Color Rule

EFFINITY follows the professional 60/30/10 color rule:

- **60%** - Neutral backgrounds (whites, grays, dark navys)
- **30%** - Complementary text and UI elements (grays, blacks, whites)
- **10%** - Brand accent (royal blue #2979FF + metallic accents)

This creates visual harmony and prevents color overload.

## Typography

### Font Family

**Primary**: Inter (system-ui fallback)
- Modern, clean, highly readable
- Excellent for UI and body text
- Variable font with multiple weights

**Monospace**: JetBrains Mono
- Use for code snippets, technical content

### Font Sizes (Strict 4-Size System)

EFFINITY uses ONLY 4 font sizes:

1. **Size 1** - `24px (1.5rem)` - Large headings
2. **Size 2** - `18px (1.125rem)` - Subheadings, important content
3. **Size 3** - `16px (1rem)` - Body text (DEFAULT)
4. **Size 4** - `14px (0.875rem)` - Small text, labels

### Font Weights (Strict 2-Weight System)

EFFINITY uses ONLY 2 font weights:

1. **Semibold (600)** - Headings, emphasis, labels
2. **Regular (400)** - Body text, general content

### Typography Best Practices

- Maximum line length: 75 characters
- Optimal line length: 60 characters
- Line height: 1.5 for body text
- Paragraph spacing: 16px (1rem)
- Section spacing: 32px (2rem)

## Spacing (8pt Grid System)

EFFINITY strictly follows an 8pt grid system:

### Base Units

- **Base**: 8px
- **Half**: 4px (for fine adjustments)

### Common Spacing Values

- 4px (0.5rem) - Minimal spacing
- 8px (1rem) - Base unit
- 12px (1.5rem) - Half + base
- 16px (2rem) - Double base
- 24px (3rem) - Section spacing
- 32px (4rem) - Large spacing
- 48px (6rem) - Extra large spacing

### Invalid Values

❌ 10px, 11px, 15px, 25px - NOT aligned to 8pt grid

### Component Spacing

- **Buttons**: 12px × 8px padding (small), 24px × 12px (medium)
- **Cards**: 24px padding (p-6)
- **Inputs**: 12px × 8px padding
- **Section gaps**: 32px, 48px, or 64px

## Mobile Optimization

### Touch Targets

- **Minimum**: 44px × 44px (Apple/Google guidelines)
- **Comfortable**: 48px × 48px
- **Large CTAs**: 56px height

### Responsive Breakpoints

- **Mobile**: 320px minimum
- **Tablet**: 768px
- **Desktop**: 1024px
- **Large**: 1440px
- **Wide**: 1920px

### Mobile Best Practices

- Bottom navigation (not hamburger menus)
- Single column layouts
- 16px minimum font size (prevents iOS zoom)
- Full-width CTAs at bottom
- Pull-to-refresh support
- Swipe gestures for actions

## Shadows & Elevation

### Shadow Levels

1. **Level 1** - `0 1px 2px rgba(0,0,0,0.05)` - Subtle lift
2. **Level 2** - `0 4px 6px rgba(0,0,0,0.1)` - Cards
3. **Level 3** - `0 10px 15px rgba(0,0,0,0.1)` - Elevated cards
4. **Level 4** - `0 20px 25px rgba(0,0,0,0.1)` - Modals
5. **Level 5** - `0 25px 50px rgba(0,0,0,0.25)` - Maximum elevation

### Brand Glow

- **Glow**: `0 0 20px rgba(41,121,255,0.3)` - Subtle brand glow
- **Intense Glow**: `0 0 50px rgba(41,121,255,0.5)` - Hero CTAs

## Gradients

### Primary Gradient

```css
background: linear-gradient(135deg, #0E1A2B 0%, #1A2F4B 40%, #2979FF 100%);
```

Use for: Hero sections, premium CTAs

### Button Gradient

```css
background: linear-gradient(180deg, #2979FF 0%, #1D4ED8 100%);
```

Use for: Primary action buttons

### Metallic Accent

```css
background: linear-gradient(135deg, #9EA7B3 0%, #CFD4DD 50%, #9EA7B3 100%);
```

Use for: Premium elements, borders

## Animation & Transitions

### Duration

- **Fast**: 150ms - Hover states, focus
- **Normal**: 300ms - Transitions, modals
- **Slow**: 500ms - Page transitions

### Easing

- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)` - General use
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)` - Entrances
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)` - Exits

### Best Practices

- Use subtle animations (avoid flashiness)
- Respect `prefers-reduced-motion`
- Keep animations under 500ms
- Fade and slide preferred over complex animations

## Accessibility

### Contrast Requirements

- **Text**: WCAG AA minimum (4.5:1 for normal text)
- **Large Text**: 3:1 minimum
- **UI Elements**: 3:1 minimum

### Focus States

- Visible focus indicators required
- 2px solid ring, brand blue color
- Never remove focus styles

### Screen Readers

- Semantic HTML required
- ARIA labels where needed
- Skip links provided
- Alt text for all images

## Brand Voice

### Tone

- Professional yet approachable
- Confident without arrogance
- Clear and concise
- Helpful and supportive

### Style Guidelines

- Use active voice
- Short sentences (15-20 words max)
- User-focused language ("You can..." not "We offer...")
- Technical but accessible
- Avoid jargon overload

### Avoid

- Overly casual language
- Vague promises
- Marketing buzzwords
- Complex technical jargon
- Passive voice

## UI Components

### Buttons

**Primary Button**
- Background: `#2979FF`
- Text: White, 14px, semibold
- Padding: 24px × 12px
- Border radius: 8px
- Hover: `#1D4ED8`

**Secondary Button**
- Background: Gray 100
- Text: Gray 900, 14px, semibold
- Border radius: 8px

**Outline Button**
- Border: 2px solid `#2979FF`
- Text: `#2979FF`, 14px, semibold

### Cards

- Background: White (light mode), `#1A2F4B` (dark mode)
- Border: 1px solid Gray 200 / Blue 20% opacity
- Border radius: 12px
- Padding: 24px
- Shadow: Level 2

### Inputs

- Height: 44px minimum
- Font size: 16px minimum (mobile)
- Padding: 12px × 8px
- Border: 1px solid Gray 300
- Focus: 2px ring, brand blue

## File Naming Conventions

### Images

- Use kebab-case: `property-image.jpg`
- Descriptive names: `dashboard-hero-section.png`
- Include dimensions for multiple sizes: `logo-512x512.png`

### Components

- PascalCase: `MobileNav.tsx`
- Descriptive: `PropertyCard.tsx`
- Avoid abbreviations: `Button.tsx` not `Btn.tsx`

## Version Control

- Current brand version: 1.0
- Last updated: October 2025
- Contact: brand@effinity.com (example)

## Resources

### Design Assets

- Logo files: `/public/logo/`
- Icons: `/public/icons/`
- Brand utilities: `/lib/brand.ts`
- Components: `/components/brand/`

### Documentation

- Figma: [Link to Figma designs]
- Storybook: [Link to component library]
- Tailwind config: `/tailwind.config.js`

---

## Quick Reference

### Colors
- Primary: `#2979FF`
- Dark BG: `#0E1A2B`
- Medium BG: `#1A2F4B`

### Spacing
- Base: 8px
- Card padding: 24px
- Section spacing: 32-64px

### Typography
- Sizes: 24px, 18px, 16px, 14px
- Weights: 600 (semibold), 400 (regular)

### Touch Targets
- Minimum: 44px × 44px

---

© 2025 EFFINITY. All brand assets and guidelines proprietary.
