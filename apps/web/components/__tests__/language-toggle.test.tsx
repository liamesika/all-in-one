/**
 * LanguageToggle Component Tests
 * 
 * Tests the language toggle component including:
 * - Language switching functionality
 * - UI state changes between English and Hebrew
 * - Accessibility features
 * - Integration with language context
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '../language-toggle';

// Mock the language context
const mockLanguageContext = {
  language: 'en',
  setLanguage: jest.fn(),
  toggleLanguage: jest.fn(),
  t: jest.fn((key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'common.english': 'English',
        'common.hebrew': 'עברית',
      },
      he: {
        'common.english': 'English',
        'common.hebrew': 'עברית',
      },
    };
    return translations[mockLanguageContext.language]?.[key] || key;
  }),
};

jest.mock('@/lib/language-context', () => ({
  useLanguage: () => mockLanguageContext,
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguageContext.language = 'en';
  });

  describe('Rendering', () => {
    it('should render language toggle button', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button', { name: /switch to hebrew language/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should display globe icon', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('🌐');
    });

    it('should show English text when language is English', () => {
      mockLanguageContext.language = 'en';
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('English');
    });

    it('should show Hebrew text when language is Hebrew', () => {
      mockLanguageContext.language = 'he';
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('עברית');
    });

    it('should have proper accessibility attributes', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button', { name: /switch to hebrew language/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle language');
    });

    it('should have proper CSS classes for styling', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'px-3',
        'py-1.5',
        'text-sm',
        'bg-white/10',
        'hover:bg-white/20',
        'rounded-lg',
        'transition-colors',
        'text-white'
      );
    });
  });

  describe('Functionality', () => {
    it('should call toggleLanguage when clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      expect(mockLanguageContext.toggleLanguage).toHaveBeenCalledTimes(1);
    });

    it('should call toggleLanguage when clicked with mouse', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      expect(mockLanguageContext.toggleLanguage).toHaveBeenCalledTimes(1);
    });

    it('should be clickable via keyboard', async () => {
      const user = userEvent.setup();
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      
      // Focus the button and press Enter
      await user.tab();
      expect(toggleButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockLanguageContext.toggleLanguage).toHaveBeenCalledTimes(1);
    });

    it('should be clickable via spacebar', async () => {
      const user = userEvent.setup();
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      
      // Focus the button and press Space
      await user.tab();
      expect(toggleButton).toHaveFocus();
      
      await user.keyboard(' ');
      expect(mockLanguageContext.toggleLanguage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function with correct keys', () => {
      mockLanguageContext.language = 'en';
      render(<LanguageToggle />);

      expect(mockLanguageContext.t).toHaveBeenCalledWith('common.english');
    });

    it('should call translation function for Hebrew', () => {
      mockLanguageContext.language = 'he';
      render(<LanguageToggle />);

      expect(mockLanguageContext.t).toHaveBeenCalledWith('common.hebrew');
    });

    it('should handle translation fallback gracefully', () => {
      mockLanguageContext.t = jest.fn(() => 'Fallback');
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('Fallback');
    });
  });

  describe('State Changes', () => {
    it('should update display when language changes from English to Hebrew', () => {
      const { rerender } = render(<LanguageToggle />);
      
      // Initially English
      expect(screen.getByText('English')).toBeInTheDocument();
      
      // Change to Hebrew
      mockLanguageContext.language = 'he';
      rerender(<LanguageToggle />);
      
      expect(screen.getByText('עברית')).toBeInTheDocument();
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('should update display when language changes from Hebrew to English', () => {
      mockLanguageContext.language = 'he';
      const { rerender } = render(<LanguageToggle />);
      
      // Initially Hebrew
      expect(screen.getByText('עברית')).toBeInTheDocument();
      
      // Change to English
      mockLanguageContext.language = 'en';
      rerender(<LanguageToggle />);
      
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.queryByText('עברית')).not.toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should always show globe emoji', () => {
      const { rerender } = render(<LanguageToggle />);
      
      expect(screen.getByText('🌐')).toBeInTheDocument();
      
      // Should still show when language changes
      mockLanguageContext.language = 'he';
      rerender(<LanguageToggle />);
      
      expect(screen.getByText('🌐')).toBeInTheDocument();
    });

    it('should have consistent button structure across languages', () => {
      const { rerender } = render(<LanguageToggle />);
      
      let toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('🌐');
      expect(toggleButton).toHaveTextContent('English');
      
      mockLanguageContext.language = 'he';
      rerender(<LanguageToggle />);
      
      toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('🌐');
      expect(toggleButton).toHaveTextContent('עברית');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Previous element</button>
          <LanguageToggle />
          <button>Next element</button>
        </div>
      );

      const previousButton = screen.getByText('Previous element');
      const languageToggle = screen.getByRole('button', { name: 'Toggle language' });
      const nextButton = screen.getByText('Next element');

      // Tab through elements
      await user.tab();
      expect(previousButton).toHaveFocus();

      await user.tab();
      expect(languageToggle).toHaveFocus();

      await user.tab();
      expect(nextButton).toHaveFocus();
    });

    it('should have descriptive aria-label', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByLabelText('Toggle language');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should be announced correctly by screen readers', () => {
      render(<LanguageToggle />);

      const toggleButton = screen.getByRole('button', { name: /switch to hebrew language/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle language');
      
      // The button should have visible text content for screen readers
      expect(toggleButton).toHaveTextContent(/English|עברית/);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation gracefully', () => {
      mockLanguageContext.t = jest.fn(() => undefined);
      
      render(<LanguageToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should handle toggleLanguage being undefined', async () => {
      mockLanguageContext.toggleLanguage = undefined as any;
      const user = userEvent.setup();
      
      render(<LanguageToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should not throw error when clicked
      await expect(user.click(toggleButton)).resolves.not.toThrow();
    });
  });
});