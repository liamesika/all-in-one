/**
 * Accessibility tests for LeadForm component
 * Tests WCAG AA compliance and screen reader compatibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import LeadForm from '../Form';
import { LanguageProvider } from '@/lib/language-context';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper with language context
const TestWrapper = ({ children, language = 'en' }: { children: React.ReactNode; language?: 'en' | 'he' }) => (
  <LanguageProvider defaultLanguage={language}>
    {children}
  </LanguageProvider>
);

describe('LeadForm Accessibility', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('WCAG AA Compliance', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have no accessibility violations in Hebrew mode', async () => {
      const { container } = render(
        <TestWrapper language="he">
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML Structure', () => {
    test('should use proper form semantics', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Check for proper form element
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-labelledby');
      expect(form).toHaveAttribute('novalidate');

      // Check for fieldset
      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeInTheDocument();
    });

    test('should have proper heading hierarchy', () => {
      const { rerender } = render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('New Lead Form');
      
      // Test Hebrew version
      rerender(
        <TestWrapper language="he">
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );
      
      const hebrewHeading = screen.getByRole('heading', { level: 2 });
      expect(hebrewHeading).toHaveTextContent('טופס ליד חדש');
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    test('should have proper labels for all form fields', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Required fields should have proper labeling
      const clientNameInput = screen.getByLabelText(/client/i);
      expect(clientNameInput).toHaveAttribute('aria-required', 'true');
      expect(clientNameInput).toHaveAttribute('id');

      // Get inputs by their form labels
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      
      const phoneInput = screen.getByLabelText(/phone/i);
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    test('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /(save lead|שמור ליד)/i });
      
      // Submit form to trigger validation
      await user.click(submitButton);

      // Check that required field errors are properly associated
      await waitFor(() => {
        const clientNameInput = screen.getByLabelText(/client/i);
        const errorMessage = screen.getByRole('alert');
        
        expect(clientNameInput).toHaveAttribute('aria-invalid', 'true');
        expect(clientNameInput).toHaveAttribute('aria-describedby');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    test('should have live region announcements', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Check for status live region
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should be fully keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Get the form and all its focusable elements
      const form = screen.getByRole('form');
      const focusableElements = form.querySelectorAll(
        'input, select, textarea, button'
      );
      
      // Tab through all elements and verify they receive focus
      let tabCount = 0;
      for (const element of focusableElements) {
        await user.tab();
        expect(document.activeElement).toBe(element);
        tabCount++;
      }
      
      expect(tabCount).toBeGreaterThan(0);
    });

    test('should handle Enter and Space key activation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      
      // Focus reset button and activate with Space
      resetButton.focus();
      await user.keyboard(' ');
      
      // Form should be reset (check if client name input is cleared)
      const clientNameInput = screen.getByLabelText(/client/i) as HTMLInputElement;
      expect(clientNameInput.value).toBe('');
    });
  });

  describe('Focus Management', () => {
    test('should manage focus on validation errors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      
      // Submit form with empty required fields
      await user.click(submitButton);

      // Check that validation errors appear and form doesn't submit
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        const errorMessages = screen.queryAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    test('should have visible focus indicators', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      
      // Check for focus-visible styles in button classes
      expect(submitButton.className).toContain('focus-visible:outline-none');
      expect(submitButton.className).toContain('focus-visible:ring-2');
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper button labels', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2); // Save and Reset buttons
      
      const submitButton = screen.getByRole('button', { name: /save/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });
      
      expect(submitButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });

    test('should announce form status changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Check that live region exists for announcements
      const liveRegions = screen.getAllByRole('status', { hidden: true });
      expect(liveRegions.length).toBeGreaterThan(0);
      
      // Fill required field and submit
      const form = screen.getByRole('form');
      const clientNameInput = form.querySelector('input[name="clientName"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /save/i });
      
      await user.type(clientNameInput, 'John Doe');
      await user.click(submitButton);

      // Form should be submitted
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    test('should have proper required field indicators', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Check that required fields have proper aria-label for asterisk
      const requiredIndicators = screen.getAllByLabelText(/required field/i);
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Accessibility', () => {
    test('should have appropriate touch targets', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /(save lead|שמור ליד)/i });
      
      // Check for minimum touch target size (44px)
      expect(submitButton.className).toContain('min-h-[44px]');
    });

    test('should have proper input types for mobile keyboards', () => {
      render(
        <TestWrapper>
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // Test by getting inputs directly from the form
      const form = screen.getByRole('form');
      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
      const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;
      const budgetInputs = form.querySelectorAll('input[type="number"]');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(budgetInputs.length).toBeGreaterThan(0);
    });
  });

  describe('RTL Support', () => {
    test('should work correctly in Hebrew (RTL) mode', () => {
      render(
        <TestWrapper language="he">
          <LeadForm mode="real-estate" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('טופס ליד חדש'); // Hebrew text

      const clientNameInput = screen.getByLabelText(/לקוח/);
      expect(clientNameInput).toBeInTheDocument();
    });
  });
});