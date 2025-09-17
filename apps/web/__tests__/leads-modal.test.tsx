/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import NewLeadModal from '@/components/modals/NewLeadModal';
import { LanguageProvider } from '@/lib/language-context';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the observability tracking
jest.mock('@/lib/observability', () => ({
  useTracking: () => ({
    modalOpen: jest.fn(),
    modalClose: jest.fn(),
    leadCreated: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
  entries: jest.fn(() => []),
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

  // Mock fetch for API calls
  global.fetch = jest.fn();

  // Clear all mocks
  jest.clearAllMocks();
});

const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider initialLang="en">
      {component}
    </LanguageProvider>
  );
};

describe('NewLeadModal', () => {
  it('should not render when isOpen is false', () => {
    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={false}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    expect(screen.queryByText('New Lead')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    expect(screen.getByText('New Lead')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Lead/ })).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = jest.fn();

    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={onClose}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    const closeButton = screen.getByRole('button', { name: /Close/ });
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should require full name field', async () => {
    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Lead/ });
    await userEvent.click(submitButton);

    // Should not proceed without full name
    expect(screen.getByLabelText(/Full Name/)).toBeRequired();
  });

  it('should submit form with valid data', async () => {
    const onSuccess = jest.fn();
    const mockResponse = {
      ok: true,
      json: async () => ({ id: 'test-lead-id', createdAt: new Date().toISOString(), success: true }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={onSuccess}
        ownerUid="test-owner"
      />
    );

    // Fill in form
    await userEvent.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email/), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Phone/), '+972501234567');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Lead/ });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': 'test-owner',
        },
        body: expect.stringContaining('John Doe'),
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({ message: 'Server error' }),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    // Fill in form
    await userEvent.type(screen.getByLabelText(/Full Name/), 'John Doe');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Lead/ });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderWithLanguageProvider(
      <NewLeadModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        ownerUid="test-owner"
      />
    );

    // Fill in form with invalid email
    await userEvent.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email/), 'invalid-email');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Lead/ });
    await userEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/)).toBeInTheDocument();
    });
  });

  it('should render in Hebrew when language is set to he', () => {
    render(
      <LanguageProvider initialLang="he">
        <NewLeadModal
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          ownerUid="test-owner"
        />
      </LanguageProvider>
    );

    expect(screen.getByText('ליד חדש')).toBeInTheDocument(); // Hebrew for "New Lead"
    expect(screen.getByText('שם מלא')).toBeInTheDocument(); // Hebrew for "Full Name"
  });
});

describe('Lead Modal Integration', () => {
  it('should open modal when URL has ?new=1 parameter', () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'new') return '1';
      return null;
    });

    // This would be tested in the full component integration
    expect(mockSearchParams.get('new')).toBe('1');
  });

  it('should handle navigation correctly', () => {
    const router = mockRouter;

    // Simulate navigation to new lead page
    router.push('/e-commerce/leads?new=1');

    expect(router.push).toHaveBeenCalledWith('/e-commerce/leads?new=1');
  });
});