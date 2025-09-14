/**
 * Accessibility Helper Functions for Campaign Components
 * 
 * Provides utilities for ARIA labels, keyboard navigation,
 * screen reader announcements, and inclusive design.
 */

/**
 * Generate descriptive ARIA labels for campaign status
 */
export function getStatusAriaLabel(status: string, t: (key: string) => string): string {
  const statusLabels = {
    'DRAFT': 'Draft status - campaign is not yet ready',
    'READY': 'Ready status - campaign is prepared but not active',
    'SCHEDULED': 'Scheduled status - campaign will start automatically',
    'ACTIVE': 'Active status - campaign is currently running',
    'PAUSED': 'Paused status - campaign is temporarily stopped',
    'ARCHIVED': 'Archived status - campaign is permanently stopped'
  };

  return statusLabels[status as keyof typeof statusLabels] || `Status: ${status}`;
}

/**
 * Generate ARIA label for campaign goal
 */
export function getGoalAriaLabel(goal: string, t: (key: string) => string): string {
  const goalDescriptions = {
    'sales': 'Sales objective - focused on driving purchases',
    'leads': 'Lead generation objective - focused on collecting contact information',
    'awareness': 'Brand awareness objective - focused on increasing brand visibility',
    'traffic': 'Traffic objective - focused on driving website visits',
    'engagement': 'Engagement objective - focused on social interactions',
    'video': 'Video views objective - focused on video content consumption',
    'reach': 'Reach objective - focused on maximum audience exposure',
    'app': 'App installs objective - focused on mobile app downloads'
  };

  return goalDescriptions[goal as keyof typeof goalDescriptions] || `Campaign goal: ${goal}`;
}

/**
 * Generate accessible form labels with validation states
 */
export function getFormFieldAriaAttributes(
  fieldName: string,
  value: string,
  error?: string,
  required = false
): {
  'aria-label': string;
  'aria-required': boolean;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
} {
  return {
    'aria-label': `${fieldName}${required ? ' (required)' : ''}`,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${fieldName}-error` : undefined
  };
}

/**
 * Generate keyboard navigation instructions
 */
export function getKeyboardInstructions(context: 'form' | 'table' | 'modal'): string {
  const instructions = {
    form: 'Use Tab to navigate between fields. Press Enter to submit, Escape to cancel.',
    table: 'Use arrow keys to navigate table cells. Press Enter to activate buttons, Space to select.',
    modal: 'Press Escape to close modal. Tab cycles through interactive elements.'
  };

  return instructions[context];
}

/**
 * Generate screen reader announcements for dynamic content
 */
export function createScreenReaderAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management for modals and dynamic content
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  // Focus first element
  firstFocusable?.focus();

  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    }

    if (e.key === 'Escape') {
      // Let parent handle escape
      element.dispatchEvent(new CustomEvent('escape-pressed'));
    }
  }

  element.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Generate color-accessible status indicators
 */
export function getAccessibleStatusIndicator(status: string): {
  color: string;
  icon: string;
  ariaLabel: string;
} {
  const indicators = {
    'DRAFT': {
      color: 'bg-gray-100 text-gray-800',
      icon: '○',
      ariaLabel: 'Draft - not ready'
    },
    'READY': {
      color: 'bg-blue-100 text-blue-800',
      icon: '◐',
      ariaLabel: 'Ready - prepared'
    },
    'SCHEDULED': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '◑',
      ariaLabel: 'Scheduled - will start soon'
    },
    'ACTIVE': {
      color: 'bg-green-100 text-green-800',
      icon: '●',
      ariaLabel: 'Active - currently running'
    },
    'PAUSED': {
      color: 'bg-orange-100 text-orange-800',
      icon: '❚❚',
      ariaLabel: 'Paused - temporarily stopped'
    },
    'ARCHIVED': {
      color: 'bg-red-100 text-red-800',
      icon: '■',
      ariaLabel: 'Archived - permanently stopped'
    }
  };

  return indicators[status as keyof typeof indicators] || indicators['DRAFT'];
}

/**
 * Validate color contrast for text readability
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  // This would implement WCAG 2.1 contrast ratio calculation
  // For now, return true - in a real implementation, you'd calculate luminance
  return true;
}

/**
 * Generate skip links for better keyboard navigation
 */
export function generateSkipLinks(): Array<{ href: string; text: string }> {
  return [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#campaign-form', text: 'Skip to campaign form' },
    { href: '#campaign-table', text: 'Skip to campaigns table' },
    { href: '#campaign-filters', text: 'Skip to search and filters' }
  ];
}

/**
 * Debounced search for better performance and accessibility
 */
export function createDebouncedSearch(
  callback: (query: string) => void,
  delay = 300
): (query: string) => void {
  let timeoutId: NodeJS.Timeout;

  return (query: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(query);
      // Announce search results count
      createScreenReaderAnnouncement(
        `Search updated. ${query ? `Results for "${query}"` : 'Showing all campaigns'}`
      );
    }, delay);
  };
}

/**
 * Form validation with accessible error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export function validateCampaignForm(data: {
  goal: string;
  copy: string;
  image?: string;
}): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (!data.goal.trim()) {
    errors.push({
      field: 'goal',
      message: 'Campaign goal is required',
      severity: 'error'
    });
  }

  if (!data.copy.trim()) {
    errors.push({
      field: 'copy',
      message: 'Campaign copy is required',
      severity: 'error'
    });
  }

  if (data.copy.length > 125) {
    errors.push({
      field: 'copy',
      message: 'Campaign copy should be 125 characters or less for optimal performance',
      severity: 'warning'
    });
  }

  if (data.image) {
    try {
      new URL(data.image);
    } catch {
      errors.push({
        field: 'image',
        message: 'Image URL is not valid',
        severity: 'error'
      });
    }
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
}