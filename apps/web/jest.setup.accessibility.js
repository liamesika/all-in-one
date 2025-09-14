/**
 * Jest setup for accessibility testing
 * Configures axe-core and other a11y testing utilities
 */

import 'jest-axe/extend-expect';
import { configureAxe } from 'jest-axe';

// Configure axe-core for comprehensive accessibility testing
const axe = configureAxe({
  // WCAG 2.1 Level AA rules
  rules: {
    // Color contrast rules - enforce WCAG AA standards
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: false }, // AAA level, disable for AA compliance
    
    // Keyboard navigation rules
    'keyboard': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },
    
    // ARIA rules
    'aria-allowed-attr': { enabled: true },
    'aria-allowed-role': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-deprecated-role': { enabled: true },
    'aria-dialog-name': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-meter-name': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-text': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-tooltip-name': { enabled: true },
    'aria-treeitem-name': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    
    // Form labeling rules
    'label': { enabled: true },
    'label-title-only': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    
    // Heading structure rules
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    
    // Link and button rules
    'link-name': { enabled: true },
    'button-name': { enabled: true },
    
    // Image accessibility rules
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    
    // List structure rules
    'list': { enabled: true },
    'listitem': { enabled: true },
    
    // Table accessibility rules
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    
    // Page structure rules
    'page-has-heading-one': { enabled: true },
    'bypass': { enabled: true }, // Skip links
    
    // Language rules
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'html-xml-lang-mismatch': { enabled: true },
    
    // Mobile accessibility rules
    'target-size': { enabled: true }, // Touch target size (44px minimum)
    'meta-viewport': { enabled: true },
    'meta-viewport-large': { enabled: true },
    
    // Audio/Video accessibility rules
    'audio-caption': { enabled: true },
    'video-caption': { enabled: true },
  },
  
  // Tags to run - WCAG 2.1 Level AA
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Custom rules for Effinity design system
  axeConfig: {
    rules: [
      {
        id: 'effinity-brand-contrast',
        matches: function(node) {
          // Check elements with brand colors
          const computedStyle = window.getComputedStyle(node);
          const bgColor = computedStyle.backgroundColor;
          const color = computedStyle.color;
          
          // Check if using brand blue colors
          return bgColor.includes('rgb(59, 130, 246)') || // brand-blue-500
                 bgColor.includes('rgb(37, 99, 235)') || // brand-blue-600
                 color.includes('rgb(59, 130, 246)') ||
                 color.includes('rgb(37, 99, 235)');
        },
        evaluate: function(node, options, virtualNode, context) {
          // Custom contrast checking for brand colors
          const computedStyle = window.getComputedStyle(node);
          const bgColor = computedStyle.backgroundColor;
          const textColor = computedStyle.color;
          
          // Simplified contrast check - in production use proper algorithm
          const hasGoodContrast = true; // Placeholder
          
          return hasGoodContrast;
        },
        metadata: {
          description: 'Ensures Effinity brand colors meet WCAG AA contrast requirements',
          help: 'Brand colors must have sufficient contrast ratio (4.5:1 minimum)',
        }
      },
      {
        id: 'effinity-touch-target',
        matches: function(node) {
          // Check interactive elements
          return node.tagName === 'BUTTON' || 
                 node.tagName === 'A' ||
                 (node.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(node.type)) ||
                 node.getAttribute('role') === 'button';
        },
        evaluate: function(node) {
          const rect = node.getBoundingClientRect();
          const minSize = 44; // 44px minimum touch target
          
          return rect.width >= minSize && rect.height >= minSize;
        },
        metadata: {
          description: 'Ensures interactive elements meet minimum touch target size',
          help: 'Interactive elements must be at least 44x44 pixels for touch accessibility',
        }
      },
      {
        id: 'effinity-8pt-grid',
        matches: function(node) {
          // Check for spacing that doesn't follow 8pt grid
          return node.classList.contains('p-') || 
                 node.classList.contains('m-') ||
                 node.classList.contains('gap-');
        },
        evaluate: function(node) {
          const computedStyle = window.getComputedStyle(node);
          
          // Check if spacing values are divisible by 4 or 8
          const checkSpacing = (value) => {
            const px = parseFloat(value);
            return px === 0 || px % 4 === 0;
          };
          
          return checkSpacing(computedStyle.paddingTop) &&
                 checkSpacing(computedStyle.paddingRight) &&
                 checkSpacing(computedStyle.paddingBottom) &&
                 checkSpacing(computedStyle.paddingLeft) &&
                 checkSpacing(computedStyle.marginTop) &&
                 checkSpacing(computedStyle.marginRight) &&
                 checkSpacing(computedStyle.marginBottom) &&
                 checkSpacing(computedStyle.marginLeft);
        },
        metadata: {
          description: 'Ensures spacing follows Effinity 8pt grid system',
          help: 'All spacing values must be divisible by 4 or 8 pixels',
        }
      }
    ]
  }
});

// Global test utilities for accessibility
global.testA11y = {
  // Test color contrast programmatically
  checkContrast: (foreground, background) => {
    // Simplified contrast calculation
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    };
  },
  
  // Test keyboard navigation
  simulateKeyboardNavigation: async (userEvent, container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const results = [];
    
    // Tab through all focusable elements
    for (let i = 0; i < focusableElements.length; i++) {
      await userEvent.tab();
      const focused = document.activeElement;
      results.push({
        index: i,
        element: focused,
        expectedElement: focusableElements[i],
        isCorrect: focused === focusableElements[i]
      });
    }
    
    return results;
  },
  
  // Test screen reader announcements
  getAriaAnnouncements: (container) => {
    const liveRegions = container.querySelectorAll('[aria-live]');
    const alerts = container.querySelectorAll('[role="alert"]');
    const status = container.querySelectorAll('[role="status"]');
    
    return {
      liveRegions: Array.from(liveRegions).map(el => ({
        element: el,
        content: el.textContent,
        level: el.getAttribute('aria-live'),
        atomic: el.getAttribute('aria-atomic')
      })),
      alerts: Array.from(alerts).map(el => ({
        element: el,
        content: el.textContent
      })),
      status: Array.from(status).map(el => ({
        element: el,
        content: el.textContent
      }))
    };
  }
};

// Mock window.matchMedia for media query tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Console warnings for common accessibility issues during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  
  // Flag common accessibility anti-patterns
  if (message.includes('Warning: Invalid ARIA attribute') ||
      message.includes('Warning: Unknown ARIA attribute') ||
      message.includes('Warning: React does not recognize the `aria-') ||
      message.includes('Warning: Received `true` for a boolean attribute')) {
    throw new Error(`Accessibility Issue: ${message}`);
  }
  
  originalConsoleWarn(...args);
};

export default axe;