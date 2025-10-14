# EFFINITY Design System Documentation

## Overview

The EFFINITY Design System is a comprehensive UI/UX framework built for the EFFINITY real estate management platform. It emphasizes consistency, accessibility, and professional aesthetics while maintaining strict adherence to brand standards.

**Version:** 1.0
**Last Updated:** October 2025
**Status:** Production Ready

---

## Core Design Principles

### 1. Effinity Brand Identity

The EFFINITY brand is built on three pillars:
- **Premium & Professional:** Elegant, minimal designs that reduce cognitive load
- **Consistent & Predictable:** Logical patterns and deliberate spacing
- **Accessible & Inclusive:** WCAG AA+ compliance for all users

### 2. The 60/30/10 Color Rule

**Strictly enforced** across all components:

- **60% - Neutral Backgrounds:** Light gray/white (light mode), dark gray (dark mode)
- **30% - Complementary Elements:** Text, borders, and UI elements
- **10% - Brand Accent:** Deep royal blue (#2979FF) with metallic/silver gradients

**Brand Colors:**
```typescript
Deep Royal Blue: #2979FF (Primary accent)
Deep Navy: #0E1A2B (Dark backgrounds)
Midnight Blue: #1A2F4B (Medium backgrounds)
```

---

## Typography System

### Strict Font Size Hierarchy (4 Sizes Only)

**CRITICAL:** Use ONLY these 4 font sizes throughout the application:

| Size | Value | Usage | Example |
|------|-------|-------|---------|
| **Size 1** | 24px (1.5rem) | Large headings | Page titles, hero headings |
| **Size 2** | 18px (1.125rem) | Subheadings, important content | Section headings, card titles |
| **Size 3** | 16px (1rem) | Body text (DEFAULT) | Paragraphs, descriptions, general content |
| **Size 4** | 14px (0.875rem) | Small text, labels | Form labels, captions, helper text |

### Strict Font Weight Hierarchy (2 Weights Only)

**CRITICAL:** Use ONLY these 2 font weights:

| Weight | Value | Usage |
|--------|-------|-------|
| **Semibold** | 600 | Headings, emphasis, labels, buttons |
| **Regular** | 400 | Body text, general content |

### Typography Usage Examples

```typescript
import { typography } from '@/lib/typography';

// Page title - Size 1, Semibold
<h1 className={typography.classes.heading1}>Dashboard Overview</h1>

// Section heading - Size 2, Semibold
<h2 className={typography.classes.heading2}>Recent Properties</h2>

// Body text - Size 3, Regular
<p className={typography.classes.body}>View your latest property listings...</p>

// Label - Size 4, Semibold
<label className={typography.classes.label}>Property Name</label>

// Caption - Size 4, Regular
<span className={typography.classes.caption}>Updated 2 hours ago</span>
```

### RTL/LTR Support

Full bidirectional text support for Hebrew (RTL) and English (LTR):

```typescript
import { typography } from '@/lib/typography';

// Text alignment adapts automatically
<div className={typography.alignment.start}>
  Aligns left in LTR, right in RTL
</div>
```

---

## Spacing System (8pt Grid)

### The 8pt Grid Rule

**NON-NEGOTIABLE:** All spacing values MUST be divisible by 8 or 4.

**Valid Values:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
**Invalid Values:** 10px, 11px, 15px, 25px

### Spacing Scale

```typescript
import { spacing } from '@/lib/spacing';

// Standard padding options
spacing.padding.p2  // 8px
spacing.padding.p4  // 16px
spacing.padding.p6  // 24px
spacing.padding.p8  // 32px

// Gap utilities for Flexbox/Grid
spacing.gap.gap2    // 8px gap
spacing.gap.gap4    // 16px gap
spacing.gap.gap6    // 24px gap
```

### Component Spacing Guidelines

| Component | Internal Padding | Spacing Between |
|-----------|-----------------|-----------------|
| Buttons | 12px x 8px (px-3 py-2) | 8px gap |
| Cards | 24px (p-6) | 24px gap |
| Form Fields | 12px x 8px (px-3 py-2) | 16px gap |
| Sections | 48px vertical (py-12) | 64px gap |

### Layout Examples

```typescript
import { spacing } from '@/lib/spacing';

// Stack layout with 16px gap
<div className={spacing.stack.stackNormal}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// 3-column responsive grid
<div className={spacing.grid.grid3Col}>
  <Card />
  <Card />
  <Card />
</div>

// Flex layout with space between
<div className={spacing.flex.flexBetween}>
  <div>Left</div>
  <div>Right</div>
</div>
```

---

## Color System

### Primary Colors (10% Usage - Accent)

```typescript
import { colors } from '@/lib/colors';

// Brand blues (use sparingly for maximum impact)
colors.brand.royalBlue     // #2979FF
colors.brand.deepNavy      // #0E1A2B
colors.brand.midnightBlue  // #1A2F4B
```

### Neutral Colors (60% Usage - Backgrounds)

```typescript
// Light mode backgrounds
colors.neutral.light.bg50   // #FAFBFC (lightest)
colors.neutral.light.bg100  // #F5F7FA (light)
colors.neutral.light.bg200  // #EBEEF2 (subtle)

// Dark mode backgrounds
colors.neutral.dark.bg900   // #070F23 (darkest)
colors.neutral.dark.bg800   // #0D162F (dark)
```

### Semantic Colors

```typescript
// Success (Green)
colors.semantic.success[700]  // #15803D

// Warning (Amber)
colors.semantic.warning[700]  // #B45309

// Error (Red)
colors.semantic.error[700]    // #B91C1C

// Info (Blue - brand color)
colors.semantic.info[700]     // #1D4ED8
```

### Color Usage Examples

```typescript
import { colors } from '@/lib/colors';

// Button with brand accent
<button className={colors.components.button.primary}>
  Save Changes
</button>

// Card with neutral background
<div className={colors.components.card.default}>
  Card content
</div>

// Success message
<div className={colors.classes.semantic.successBg}>
  <span className={colors.classes.semantic.success}>
    Success! Your changes have been saved.
  </span>
</div>
```

### OKLCH Color Format (Tailwind v4)

Modern color format for better perceptual uniformity:

```css
/* Brand royal blue in OKLCH */
color: oklch(0.55 0.22 240);

/* Neutral gray in OKLCH */
color: oklch(0.70 0.015 240);
```

---

## Animation System

### Animation Timing Standards

**ALL animations must use these timings:**

- **Fast:** 150ms - Micro-interactions (hover states)
- **Normal:** 200ms - Standard transitions (DEFAULT)
- **Medium:** 300ms - Complex animations
- **Slow:** 400ms - Page transitions

### Easing Functions

```typescript
import { animations } from '@/lib/animations';

// Recommended easing
animations.easing.default  // cubic-bezier(0.4, 0, 0.2, 1)
animations.easing.spring   // cubic-bezier(0.68, -0.55, 0.265, 1.55)
animations.easing.smooth   // cubic-bezier(0.25, 0.1, 0.25, 1)
```

### Page Transitions

```typescript
import { animations } from '@/lib/animations';

// Fade in animation
<div className={animations.page.fadeIn}>
  Page content
</div>

// Slide up animation
<div className={animations.page.slideUp}>
  Modal content
</div>

// Scale in animation
<div className={animations.page.scaleIn}>
  Popup content
</div>
```

### Hover Effects

```typescript
import { animations } from '@/lib/animations';

// Lift effect on hover
<div className={animations.hover.lift}>
  Card content
</div>

// Card with premium hover animation
<div className={animations.hover.cardHover}>
  Interactive card
</div>

// Button with magnetic effect
<button className={animations.hover.buttonMagnetic}>
  Click me
</button>
```

### Loading States

```typescript
import { animations } from '@/lib/animations';

// Spinner
<div className={animations.loading.spinner} />

// Shimmer loading effect
<div className={animations.loading.shimmer} />

// Pulse animation
<div className={animations.loading.pulse} />
```

### Accessibility: Reduced Motion

**CRITICAL:** All animations respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are automatically disabled */
}
```

---

## Components

### Button Component

```typescript
import { Button } from '@/components/ui';

// Primary button (brand accent)
<Button variant="primary" size="md">
  Save Changes
</Button>

// Secondary button
<Button variant="secondary" size="md">
  Cancel
</Button>

// Destructive button
<Button variant="destructive" size="sm">
  Delete
</Button>

// With loading state
<Button variant="primary" disabled>
  <Spinner size="sm" color="white" />
  Saving...
</Button>
```

**Button Sizes:**
- `sm`: 32px height, 12px text
- `md`: 44px height, 14px text (DEFAULT)
- `lg`: 48px height, 16px text

### Card Component

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Property Details</CardTitle>
  </CardHeader>
  <CardContent>
    Card content with 24px padding
  </CardContent>
</Card>
```

### Badge Component

```typescript
import { Badge, StatusBadge, CountBadge } from '@/components/ui/badge';

// Semantic badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>

// Status badge
<StatusBadge status="active" />

// Count badge (notification)
<CountBadge count={5} variant="error" />

// Badge with dot indicator
<Badge variant="success" dot>Online</Badge>

// Removable badge
<Badge variant="primary" removable onRemove={() => console.log('removed')}>
  Tag
</Badge>
```

### Progress Component

```typescript
import {
  Progress,
  CircularProgress,
  MultiStepProgress,
  IndeterminateProgress
} from '@/components/ui/progress';

// Linear progress
<Progress value={75} variant="default" showLabel />

// Circular progress
<CircularProgress value={60} size={64} variant="success" />

// Multi-step progress (wizard)
<MultiStepProgress
  steps={[
    { label: 'Step 1', completed: true },
    { label: 'Step 2', completed: false },
    { label: 'Step 3', completed: false }
  ]}
  currentStep={1}
/>

// Indeterminate progress (unknown duration)
<IndeterminateProgress variant="default" />
```

### Tooltip Component

```typescript
import { Tooltip, SimpleTooltip, InfoTooltip } from '@/components/ui/tooltip';

// Standard tooltip
<Tooltip content="This is helpful information" position="top">
  <button>Hover me</button>
</Tooltip>

// Simple tooltip
<SimpleTooltip text="Quick tip">
  <span>Hover for info</span>
</SimpleTooltip>

// Info icon with tooltip
<InfoTooltip text="Additional details about this field" />

// Rich tooltip with title and description
<RichTooltip
  title="Premium Feature"
  description="Upgrade to access this feature"
  action={{ label: "Upgrade Now", onClick: () => {} }}
>
  <button>Premium</button>
</RichTooltip>
```

### Skeleton Loading Component

```typescript
import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonDashboard
} from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton variant="text" width="80%" />

// Card skeleton
<SkeletonCard hasImage hasAvatar />

// Table skeleton
<SkeletonTable rows={5} columns={4} hasHeader />

// Full dashboard skeleton
<SkeletonDashboard />

// Loading wrapper
<LoadingWrapper
  isLoading={isLoading}
  skeleton={<SkeletonCard />}
>
  <ActualContent />
</LoadingWrapper>
```

### Input Component

```typescript
import { Input, Label } from '@/components/ui';

// Standard input with label
<div className="space-y-2">
  <Label htmlFor="email" required>Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    aria-label="Email address"
    aria-required="true"
  />
</div>

// Input with error state
<Input
  type="text"
  aria-invalid="true"
  aria-describedby="error-message"
  className="border-red-500 focus:ring-red-500"
/>
<span id="error-message" className="text-sm text-red-700">
  This field is required
</span>
```

### Modal/Dialog Component

```typescript
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="md"
  closeOnOverlayClick
>
  <ModalHeader>
    <ModalTitle>Confirm Action</ModalTitle>
  </ModalHeader>
  <ModalContent>
    Are you sure you want to proceed?
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

---

## Accessibility Standards

### WCAG AA+ Compliance

**All components must meet:**
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text (24px+)
- Keyboard navigation support
- Screen reader compatibility
- Focus-visible indicators

### Focus States

```typescript
// All interactive elements have enhanced focus-visible
<button className="focus-visible:outline-2 focus-visible:outline-blue-700">
  Interactive Element
</button>

// Global focus-visible styling is automatically applied
```

### Keyboard Navigation

**Required for all interactive components:**
- `Tab` - Move forward
- `Shift + Tab` - Move backward
- `Enter/Space` - Activate buttons
- `Escape` - Close modals/dropdowns
- Arrow keys - Navigate lists/menus

### ARIA Labels

```typescript
// All components include proper ARIA attributes
<button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  <CloseIcon aria-hidden="true" />
</button>

// Loading states
<div role="status" aria-label="Loading...">
  <Spinner />
</div>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress: 75%"
/>
```

### Skip to Main Content

```html
<!-- Add at the top of every page -->
<a href="#main-content" className="skip-to-main">
  Skip to main content
</a>

<main id="main-content">
  <!-- Page content -->
</main>
```

---

## Performance Best Practices

### GPU Acceleration

```typescript
// For animated elements
<div className="gpu-accelerated">
  Smooth animations
</div>
```

### List Optimization

```typescript
// For large lists
<div className="optimize-rendering">
  <VirtualizedList items={1000} />
</div>
```

### Lazy Loading Images

```typescript
<img
  src={imageSrc}
  loading="lazy"
  alt="Property image"
/>
```

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <SkeletonCard />,
  ssr: false
});
```

---

## Responsive Design

### Breakpoints

```typescript
import { spacing } from '@/lib/spacing';

spacing.breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
}
```

### Mobile-First Approach

```typescript
// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Responsive typography
<h1 className={typography.responsive.heading1Responsive}>
  Automatically scales on mobile
</h1>
```

---

## Dark Mode Support

### Color Inversion

```typescript
// Light mode: white background, dark text
// Dark mode: dark background, light text
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

### Shadow Adjustments

```typescript
import { colors } from '@/lib/colors';

// Shadows are more pronounced in dark mode
colors.shadows.light.md  // Light mode shadow
colors.shadows.dark.md   // Dark mode shadow (stronger)
```

---

## Usage Guidelines

### DO ✅

- Use ONLY the 4 approved font sizes
- Use ONLY the 2 approved font weights
- Follow the 8pt grid for ALL spacing
- Respect the 60/30/10 color rule
- Include proper ARIA labels
- Test keyboard navigation
- Provide loading states
- Use semantic HTML

### DON'T ❌

- Create custom font sizes outside the system
- Use font weights other than 400 and 600
- Use spacing values not divisible by 4 or 8
- Overuse brand accent colors (>10% usage)
- Forget focus-visible states
- Skip accessibility testing
- Animate without considering reduced motion
- Use non-semantic HTML elements

---

## Migration Guide

### From Old System to New Design System

**Step 1:** Import the design system utilities
```typescript
import { typography, spacing, colors, animations } from '@/lib/[utility]';
```

**Step 2:** Replace inline styles with system classes
```typescript
// Old ❌
<h1 style={{ fontSize: '22px', fontWeight: 700 }}>Title</h1>

// New ✅
<h1 className={typography.classes.heading1}>Title</h1>
```

**Step 3:** Update spacing to follow 8pt grid
```typescript
// Old ❌
<div className="p-5 gap-3.5">Content</div>

// New ✅
<div className={`${spacing.padding.p6} ${spacing.gap.gap4}`}>Content</div>
```

**Step 4:** Use semantic color classes
```typescript
// Old ❌
<button className="bg-blue-600 text-white">Button</button>

// New ✅
<Button variant="primary">Button</Button>
```

---

## Resources

### Design System Files

```
/apps/web/lib/
  ├── animations.ts     - Animation utilities
  ├── typography.ts     - Typography system
  ├── spacing.ts        - Spacing & layout
  └── colors.ts         - Color system

/apps/web/components/ui/
  ├── button.tsx        - Button component
  ├── badge.tsx         - Badge component
  ├── progress.tsx      - Progress components
  ├── tooltip.tsx       - Tooltip component
  ├── skeleton.tsx      - Loading skeletons
  └── ui.tsx           - Core UI components

/apps/web/app/globals.css - Global styles and animations
```

### Support & Feedback

For questions or suggestions about the design system:
- Review this documentation first
- Check component source code for examples
- Test thoroughly with keyboard and screen readers
- Validate against WCAG AA standards

---

**End of EFFINITY Design System Documentation v1.0**

*Maintaining consistency, accessibility, and professional quality across the platform.*
