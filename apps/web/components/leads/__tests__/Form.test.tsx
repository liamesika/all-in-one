/**
 * LeadForm Component Tests
 * 
 * Tests the lead form component including:
 * - Form rendering with proper fields
 * - Multi-language support (English/Hebrew)
 * - Form validation and submission
 * - Field interaction and data binding
 * - RTL layout support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadForm from '../Form';

// Mock the language context
const mockLanguageContext = {
  language: 'en',
  setLanguage: jest.fn(),
};

jest.mock('@/lib/language-context', () => ({
  useLanguage: () => mockLanguageContext,
}));

describe('LeadForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguageContext.language = 'en';
  });

  describe('Form Rendering', () => {
    it('should render all real estate fields in English', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Check required fields
      expect(screen.getByLabelText('Client *')).toBeInTheDocument();
      
      // Check optional fields
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Property Type')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
      expect(screen.getByLabelText('Budget From')).toBeInTheDocument();
      expect(screen.getByLabelText('Budget To')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Source')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();

      // Check submit button
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should render all real estate fields in Hebrew', () => {
      mockLanguageContext.language = 'he';
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Check Hebrew labels
      expect(screen.getByLabelText('לקוח *')).toBeInTheDocument();
      expect(screen.getByLabelText('טלפון')).toBeInTheDocument();
      expect(screen.getByLabelText('אימייל')).toBeInTheDocument();
      expect(screen.getByLabelText('סוג נכס')).toBeInTheDocument();
      expect(screen.getByLabelText('עיר')).toBeInTheDocument();
      expect(screen.getByLabelText('תקציב מ־')).toBeInTheDocument();
      expect(screen.getByLabelText('תקציב עד')).toBeInTheDocument();
      expect(screen.getByLabelText('סטטוס')).toBeInTheDocument();
      expect(screen.getByLabelText('מקור')).toBeInTheDocument();
      expect(screen.getByLabelText('הערות')).toBeInTheDocument();

      // Check Hebrew submit button
      expect(screen.getByRole('button', { name: 'שמירה' })).toBeInTheDocument();
    });

    it('should render proper field types', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Text inputs
      expect(screen.getByLabelText('Client *')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'text');

      // Number inputs
      expect(screen.getByLabelText('Budget From')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Budget To')).toHaveAttribute('type', 'number');

      // Select dropdowns
      expect(screen.getByLabelText('Property Type').tagName).toBe('SELECT');
      expect(screen.getByLabelText('Status').tagName).toBe('SELECT');

      // Textarea
      expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA');
    });

    it('should show required field indicators', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const clientField = screen.getByLabelText('Client *');
      expect(clientField).toBeRequired();

      const phoneField = screen.getByLabelText('Phone');
      expect(phoneField).not.toBeRequired();
    });
  });

  describe('Select Options', () => {
    it('should show English property type options', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const propertyTypeSelect = screen.getByLabelText('Property Type');
      expect(propertyTypeSelect).toBeInTheDocument();

      // Check that options exist (rendered as option elements)
      const apartmentOption = screen.getByText('Apartment');
      const houseOption = screen.getByText('House');
      expect(apartmentOption).toBeInTheDocument();
      expect(houseOption).toBeInTheDocument();
    });

    it('should show Hebrew property type options', () => {
      mockLanguageContext.language = 'he';
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const propertyTypeSelect = screen.getByLabelText('סוג נכס');
      expect(propertyTypeSelect).toBeInTheDocument();

      // Check Hebrew options
      const apartmentOption = screen.getByText('דירה');
      const houseOption = screen.getByText('בית');
      expect(apartmentOption).toBeInTheDocument();
      expect(houseOption).toBeInTheDocument();
    });

    it('should show status options with proper default', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
      expect(statusSelect.value).toBe('NEW'); // Default value
    });
  });

  describe('Form Interaction', () => {
    it('should update field values when user types', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const clientField = screen.getByLabelText('Client *') as HTMLInputElement;
      
      await user.type(clientField, 'John Doe');
      expect(clientField.value).toBe('John Doe');
    });

    it('should update select field values', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const propertyTypeSelect = screen.getByLabelText('Property Type') as HTMLSelectElement;
      
      await user.selectOptions(propertyTypeSelect, 'Apartment');
      expect(propertyTypeSelect.value).toBe('Apartment');
    });

    it('should update textarea values', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const notesField = screen.getByLabelText('Notes') as HTMLTextAreaElement;
      
      await user.type(notesField, 'Important client notes');
      expect(notesField.value).toBe('Important client notes');
    });

    it('should handle number input values', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const budgetMinField = screen.getByLabelText('Budget From') as HTMLInputElement;
      
      await user.type(budgetMinField, '500000');
      expect(budgetMinField.value).toBe('500000');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText('Client *'), 'John Doe');
      await user.type(screen.getByLabelText('Phone'), '+1234567890');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.selectOptions(screen.getByLabelText('Property Type'), 'Apartment');
      await user.type(screen.getByLabelText('Budget From'), '400000');
      await user.type(screen.getByLabelText('Budget To'), '600000');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        clientName: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        propertyType: 'Apartment',
        city: '',
        budgetMin: 400000,
        budgetMax: 600000,
        status: 'NEW', // Default value
        source: '',
        notes: '',
      });
    });

    it('should convert empty budget values to null', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Fill required field only
      await user.type(screen.getByLabelText('Client *'), 'Jane Doe');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetMin: null,
          budgetMax: null,
        })
      );
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<LeadForm mode="real-estate" onSubmit={slowOnSubmit} />);

      // Fill required field
      await user.type(screen.getByLabelText('Client *'), 'Test User');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      });
    });

    it('should show Hebrew loading state', async () => {
      mockLanguageContext.language = 'he';
      const user = userEvent.setup();
      const slowOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<LeadForm mode="real-estate" onSubmit={slowOnSubmit} />);

      // Fill required field
      await user.type(screen.getByLabelText('לקוח *'), 'משתמש בדיקה');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'שמירה' });
      await user.click(submitButton);

      // Should show Hebrew loading state
      expect(screen.getByRole('button', { name: 'שומר…' })).toBeInTheDocument();
    });

    it('should prevent double submission', async () => {
      const user = userEvent.setup();
      const slowOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<LeadForm mode="real-estate" onSubmit={slowOnSubmit} />);

      // Fill required field
      await user.type(screen.getByLabelText('Client *'), 'Test User');

      // Submit form multiple times quickly
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call onSubmit once
      expect(slowOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Fill form
      const clientField = screen.getByLabelText('Client *') as HTMLInputElement;
      const phoneField = screen.getByLabelText('Phone') as HTMLInputElement;
      
      await user.type(clientField, 'John Doe');
      await user.type(phoneField, '+1234567890');

      expect(clientField.value).toBe('John Doe');
      expect(phoneField.value).toBe('+1234567890');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      // Form should be reset
      await waitFor(() => {
        expect(clientField.value).toBe('');
        expect(phoneField.value).toBe('');
      });
    });
  });

  describe('Form Validation', () => {
    it('should prevent submission with empty required fields', async () => {
      const user = userEvent.setup();
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      // Try to submit without filling required field
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      // onSubmit should not be called due to HTML5 validation
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require client name field', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const clientField = screen.getByLabelText('Client *');
      expect(clientField).toBeRequired();
    });

    it('should not require optional fields', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('Phone')).not.toBeRequired();
      expect(screen.getByLabelText('Email')).not.toBeRequired();
      expect(screen.getByLabelText('City')).not.toBeRequired();
    });
  });

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnSubmit = jest.fn(() => Promise.reject(new Error('Submission failed')));
      
      render(<LeadForm mode="real-estate" onSubmit={errorOnSubmit} />);

      // Fill required field
      await user.type(screen.getByLabelText('Client *'), 'Test User');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save' });
      await user.click(submitButton);

      // Should eventually show normal state again after error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should associate labels with form controls', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const clientField = screen.getByLabelText('Client *');
      expect(clientField).toBeInTheDocument();
      expect(clientField.tagName).toBe('INPUT');
    });

    it('should have accessible submit button', () => {
      render(<LeadForm mode="real-estate" onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Save' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Mode Support', () => {
    it('should handle unknown modes gracefully', () => {
      render(<LeadForm mode="unknown-mode" onSubmit={mockOnSubmit} />);

      // Should render a form even with unknown mode (empty fields)
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const submitButton = screen.getByRole('button', { name: 'Save' });
      expect(submitButton).toBeInTheDocument();
    });

    it('should default to real-estate mode when no mode specified', () => {
      render(<LeadForm onSubmit={mockOnSubmit} />);

      // Should show real estate fields
      expect(screen.getByLabelText('Client *')).toBeInTheDocument();
      expect(screen.getByLabelText('Property Type')).toBeInTheDocument();
    });
  });
});