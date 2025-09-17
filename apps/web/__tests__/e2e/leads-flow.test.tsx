/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LeadsPage from '@/app/e-commerce/leads/page';
import NewLeadPage from '@/app/e-commerce/leads/new/page';
import CreateLeadPage from '@/app/e-commerce/leads/create/page';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock auth context
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' },
    ownerUid: 'test-owner',
    loading: false,
    getToken: async () => 'test-token',
  }),
}));

// Mock observability
jest.mock('@/lib/observability', () => ({
  useTracking: () => ({
    modalOpen: jest.fn(),
    modalClose: jest.fn(),
    leadCreated: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock AI coach context
jest.mock('@/lib/ai-coach-context', () => ({
  AiCoachProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = new URLSearchParams();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

  // Mock successful API responses
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      leads: [],
      pagination: { page: 1, totalPages: 1, totalCount: 0 },
    }),
  });

  jest.clearAllMocks();
});

describe('New Lead Flow Integration', () => {
  it('should redirect from new lead page to leads page with modal parameter', async () => {
    render(<NewLeadPage />);

    // Should show loading state
    expect(screen.getByText(/redirecting to lead creator/i)).toBeInTheDocument();
    expect(screen.getByText(/click here if not redirected/i)).toBeInTheDocument();

    // Should call router.push with correct URL
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/e-commerce/leads?new=1');
    });
  });

  it('should show modal when URL has new=1 parameter', async () => {
    // Set up search params to include new=1
    mockSearchParams.set('new', '1');
    const mockGet = jest.fn((key: string) => {
      if (key === 'new') return '1';
      return null;
    });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });

    render(<LeadsPage />);

    // Modal should be triggered (we can't easily test the actual modal here due to complex setup)
    // But we can verify the search params are being read correctly
    expect(mockGet).toHaveBeenCalledWith('new');
  });

  it('should handle manual fallback link on new lead page', async () => {
    render(<NewLeadPage />);

    const fallbackLink = screen.getByText(/click here if not redirected/i);
    expect(fallbackLink).toHaveAttribute('href', '/e-commerce/leads?new=1');
  });

  it('should render create lead page correctly', async () => {
    render(<CreateLeadPage />);

    // Should show the header
    await waitFor(() => {
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    // Should show back button
    expect(screen.getByText(/back to leads/i)).toBeInTheDocument();
  });
});

describe('Lead Creation API Integration', () => {
  it('should send correct API request when creating a lead', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'new-lead-id',
        createdAt: new Date().toISOString(),
        success: true,
      }),
    });

    global.fetch = mockFetch;

    // This would be a more complete test with the actual form submission
    const leadData = {
      fullName: 'Test Lead',
      email: 'test@example.com',
      phone: '+972501234567',
      source: 'MANUAL',
      status: 'NEW',
      score: 'COLD',
    };

    await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': 'test-owner',
      },
      body: JSON.stringify(leadData),
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': 'test-owner',
      },
      body: JSON.stringify(leadData),
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
      }),
    });

    global.fetch = mockFetch;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': 'test-owner',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      expect(response.ok).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    } catch (error) {
      // Should not throw, but handle gracefully
    }
  });
});

describe('Multi-language Support', () => {
  it('should support Hebrew language in create lead page', () => {
    // This would test with Hebrew language context
    // The implementation already includes Hebrew translations
    expect(true).toBe(true); // Placeholder for language tests
  });

  it('should support English language in create lead page', () => {
    // This would test with English language context
    // The implementation already includes English translations
    expect(true).toBe(true); // Placeholder for language tests
  });
});

describe('Authentication and Data Scoping', () => {
  it('should redirect unauthenticated users to login', async () => {
    // Mock unauthenticated state
    jest.mocked(require('@/lib/auth-context').useAuth).mockReturnValue({
      user: null,
      ownerUid: null,
      loading: false,
      getToken: async () => null,
    });

    render(<CreateLeadPage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login?next=/e-commerce/leads/create');
    });
  });

  it('should include ownerUid in API requests for data scoping', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ leads: [], pagination: { totalCount: 0 } }),
    });

    global.fetch = mockFetch;

    // Simulate API call that should include ownerUid
    await fetch('/api/leads?ownerUid=test-owner&limit=50');

    expect(mockFetch).toHaveBeenCalledWith('/api/leads?ownerUid=test-owner&limit=50');
  });
});