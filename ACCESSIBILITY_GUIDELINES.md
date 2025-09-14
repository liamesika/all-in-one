# Effinity Platform - Accessibility Guidelines

## Overview

This document outlines the accessibility standards and implementation guidelines for the Effinity all-in-one platform. These guidelines ensure WCAG AA compliance and provide an inclusive experience for all users, including those who rely on assistive technologies.

## Quick Start Checklist

### ✅ Before Committing Code:
- [ ] Components pass automated accessibility tests (run `npm test -- accessibility`)
- [ ] All interactive elements have proper ARIA labels
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 minimum)
- [ ] Components are keyboard navigable
- [ ] Form fields have proper labeling and error associations
- [ ] Focus management is implemented for dynamic content

## Design System Compliance

### Color and Contrast Standards

**WCAG AA Requirements:**
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio for boundaries/icons

**Approved Effinity Colors:**
```css
/* Primary Brand Colors (60/30/10 rule) */
--brand-blue-500: #3b82f6;  /* 4.5:1 on white */
--brand-blue-600: #2563eb;  /* 5.9:1 on white */  
--brand-blue-700: #1d4ed8;  /* 8.6:1 on white */

/* Neutral Backgrounds (60%) */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;

/* Text Colors (30%) */
--gray-600: #4b5563;  /* 7.0:1 on white */
--gray-700: #374151;  /* 10.8:1 on white */
--gray-900: #111827;  /* 15.8:1 on white */

/* Accent Colors (10%) */
--metallic-500: #64748b;  /* 4.6:1 on white */
```

### Typography Hierarchy

**Use ONLY these 4 font sizes:**
```css
/* Size 1 - Large headings */
.text-effinity-1 { font-size: 20px; font-weight: 600; }

/* Size 2 - Subheadings/Important content */
.text-effinity-2 { font-size: 16px; font-weight: 600; }

/* Size 3 - Body text */  
.text-effinity-3 { font-size: 14px; font-weight: 400; }

/* Size 4 - Small text/labels */
.text-effinity-4 { font-size: 12px; font-weight: 400; }
```

### 8pt Grid System

**All spacing must be divisible by 8 or 4:**
```css
/* Approved spacing values */
padding: 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px;
margin: 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px;
gap: 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px;

/* ❌ Avoid */
padding: 15px, 25px, 35px, 45px;
```

## Implementation Guidelines

### 1. Form Accessibility

**Required Elements:**
```tsx
<form 
  role="form"
  aria-labelledby="form-title"
  aria-describedby="form-description"
  noValidate
>
  <fieldset disabled={loading}>
    <legend className="sr-only">Form Fields</legend>
    
    <label htmlFor="field-id" className="required">
      Field Label
      <span className="text-red-500" aria-label="required field">*</span>
    </label>
    
    <input
      id="field-id"
      name="fieldName"
      type="text"
      required
      aria-required="true"
      aria-invalid={hasError}
      aria-describedby={hasError ? "field-error" : undefined}
      className="min-h-[44px]" // Minimum touch target
    />
    
    {hasError && (
      <div 
        id="field-error" 
        role="alert" 
        aria-live="polite"
        className="text-red-600"
      >
        Error message here
      </div>
    )}
  </fieldset>
</form>
```

**Form Validation:**
```tsx
// Status announcements
<div 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {loading && "Saving form..."}
  {errorCount > 0 && `Found ${errorCount} errors in the form`}
</div>

// Error focus management
if (!isValid) {
  const firstErrorField = document.getElementById(firstErrorFieldId);
  firstErrorField?.focus();
}
```

### 2. Button Accessibility

**Interactive Elements:**
```tsx
<button
  type="button"
  aria-label="Descriptive action label"
  aria-describedby={loading ? "status-id" : undefined}
  disabled={loading}
  className="
    min-h-[44px] min-w-[44px] /* Minimum touch targets */
    focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-blue-500 focus-visible:ring-offset-2
  "
>
  {loading && (
    <svg className="animate-spin" aria-hidden="true">
      {/* Loading icon */}
    </svg>
  )}
  <span>Button Text</span>
</button>
```

### 3. Navigation Accessibility

**Header Structure:**
```tsx
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only"
    >
      Skip to main content
    </a>
    
    <h1>
      <a 
        href="/" 
        aria-label="Effinity - Go to homepage"
        className="focus-visible:ring-2"
      >
        EFFINITY
      </a>
    </h1>
  </nav>
</header>

<main id="main-content" tabIndex="-1">
  {/* Page content */}
</main>
```

**Heading Hierarchy:**
```tsx
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h3>Another Subsection</h3>
  <h2>Another Section</h2>
```

### 4. Dynamic Content

**Live Regions:**
```tsx
// Status updates
<div 
  aria-live="polite" 
  aria-atomic="true"
  role="status"
  className="sr-only"
>
  {statusMessage}
</div>

// Critical alerts
<div 
  aria-live="assertive" 
  role="alert"
  className="border-red-200 bg-red-50 p-4"
>
  {errorMessage}
</div>
```

**Modal/Dialog Accessibility:**
```tsx
<div 
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
  onKeyDown={handleEscapeKey}
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-description">Dialog description</p>
  
  {/* Focus trap implementation */}
  <div onKeyDown={trapFocus}>
    {/* Dialog content */}
  </div>
</div>
```

## Testing Requirements

### Automated Testing

**Run accessibility tests:**
```bash
# Run all accessibility tests
npm test -- accessibility

# Run specific component accessibility tests
npm test -- Form.accessibility.test.tsx
```

**Required Test Coverage:**
```tsx
describe('Component Accessibility', () => {
  test('should have no WCAG violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should be keyboard navigable', async () => {
    // Test tab navigation
  });
  
  test('should have proper ARIA labels', () => {
    // Test ARIA attributes
  });
  
  test('should manage focus correctly', () => {
    // Test focus management
  });
});
```

### Manual Testing

**Keyboard Navigation:**
1. Tab through all interactive elements
2. Use Enter/Space to activate buttons
3. Use arrow keys for dropdowns/menus
4. Test Escape key for modals
5. Verify focus is visible and logical

**Screen Reader Testing:**
1. Test with NVDA (Windows) or VoiceOver (Mac)
2. Verify all content is announced properly
3. Check form field associations
4. Test error announcements
5. Verify live region updates

**Visual Testing:**
1. Test with high contrast mode
2. Test at 200% zoom
3. Verify with color blindness simulation
4. Test in both light and dark modes
5. Verify RTL layout for Hebrew content

## Mobile Accessibility

### Touch Target Requirements
- Minimum 44x44px for all interactive elements
- Adequate spacing between touch targets (8px minimum)
- Consistent placement across screens

### Mobile-Specific Patterns
```tsx
<input 
  type="email" // Shows email keyboard
  inputMode="email"
  autoComplete="email"
/>

<input 
  type="tel" // Shows numeric keypad  
  inputMode="tel"
  autoComplete="tel"
/>

<button 
  className="min-h-[48px] px-6" // Larger touch targets on mobile
  aria-label="Mobile-friendly button label"
>
  Action
</button>
```

## Multi-language Support (RTL)

### Hebrew Language Support
```tsx
<html lang="he" dir="rtl">
  <body className="rtl">
    <div className="text-right"> {/* RTL text alignment */}
      <label htmlFor="field">שדה טקסט</label>
      <input 
        id="field"
        placeholder="הכנס טקסט..."
        className="text-right" // RTL input alignment
      />
    </div>
  </body>
</html>
```

## Error Prevention and Recovery

### Form Validation Strategy
1. **Inline validation** - Show errors as user types
2. **Submit validation** - Validate all fields on submit
3. **Error summary** - List all errors at top of form
4. **Focus management** - Move focus to first error
5. **Clear instructions** - Explain how to fix errors

### Error Message Guidelines
```tsx
// ✅ Good error messages
"Email address is required"
"Password must be at least 8 characters"
"Please select a valid date"

// ❌ Avoid these
"Invalid input"
"Error"
"Please fix"
```

## Performance and Accessibility

### Code Splitting for A11y Libraries
```tsx
// Lazy load accessibility tools in development
const A11yTester = lazy(() => 
  process.env.NODE_ENV === 'development' 
    ? import('./A11yTester')
    : Promise.resolve({ default: () => null })
);
```

### Reduced Motion Support
```tsx
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);
  
  return reducedMotion;
};
```

## Tools and Resources

### Development Tools
- **@axe-core/react** - Runtime accessibility testing
- **jest-axe** - Automated testing
- **eslint-plugin-jsx-a11y** - Static analysis
- **WAVE browser extension** - Page analysis

### Testing Tools
- **NVDA** (Free screen reader)
- **JAWS** (Popular screen reader)  
- **VoiceOver** (Built into Mac/iOS)
- **Colour Contrast Analyser** - Color testing
- **axe DevTools** - Browser extension

### Useful Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Accessibility Checklist

### Pre-Development
- [ ] Review design for accessibility considerations
- [ ] Identify keyboard navigation patterns
- [ ] Plan focus management for dynamic content
- [ ] Consider screen reader user experience

### Development
- [ ] Use semantic HTML elements
- [ ] Add proper ARIA labels and descriptions
- [ ] Implement keyboard navigation
- [ ] Ensure proper color contrast
- [ ] Add form validation and error handling
- [ ] Test with screen readers

### Pre-Commit
- [ ] Run automated accessibility tests
- [ ] Verify keyboard navigation works
- [ ] Check color contrast ratios
- [ ] Test with screen reader
- [ ] Validate HTML semantics

### Post-Deployment
- [ ] Conduct user testing with disabled users
- [ ] Monitor accessibility metrics
- [ ] Gather feedback on assistive technology usage
- [ ] Continue improving based on real usage

## Getting Help

### Internal Resources
- **Accessibility Testing**: Run `npm test -- accessibility`
- **Design System**: See `/components/ui.tsx`
- **Code Examples**: Check `/lib/accessibility.tsx`

### External Support
- **WebAIM**: Free accessibility evaluation
- **Deque University**: Accessibility training
- **A11y Project**: Community resources
- **ARIA specification**: Technical reference

---

**Remember**: Accessibility is not a one-time task but an ongoing commitment to inclusive design. Every team member is responsible for ensuring our platform works for all users.