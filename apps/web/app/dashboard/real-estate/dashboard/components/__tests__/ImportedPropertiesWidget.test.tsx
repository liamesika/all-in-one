import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImportedPropertiesWidget } from '../ImportedPropertiesWidget';

// Mock fetch
global.fetch = jest.fn();

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

describe('ImportedPropertiesWidget', () => {
  const mockProperties = [
    {
      id: 'property-1',
      name: 'Modern Apartment in Tel Aviv',
      address: '123 Rothschild Blvd',
      city: 'Tel Aviv',
      price: 2500000,
      currency: 'ILS',
      provider: 'YAD2',
      externalUrl: 'https://yad2.co.il/property/123',
      aiScore: 85,
      aiCategory: 'excellent',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'property-2',
      name: 'Cozy House in Jerusalem',
      address: '456 King George St',
      city: 'Jerusalem',
      price: 1800000,
      currency: 'ILS',
      provider: 'MADLAN',
      externalUrl: 'https://madlan.co.il/property/456',
      aiScore: 72,
      aiCategory: 'good',
      createdAt: '2024-01-16T14:20:00Z',
    },
    {
      id: 'property-3',
      name: 'Luxury Villa in Herzliya',
      address: '789 Beach St',
      city: 'Herzliya',
      price: 5000000,
      currency: 'ILS',
      provider: 'YAD2',
      externalUrl: 'https://yad2.co.il/property/789',
      aiScore: 45,
      aiCategory: 'fair',
      createdAt: '2024-01-17T16:45:00Z',
    },
  ];

  const mockBatches = [
    {
      id: 'batch-1',
      source: 'YAD2',
      totalItems: 10,
      importedItems: 8,
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'batch-2',
      source: 'MADLAN',
      totalItems: 5,
      importedItems: 3,
      status: 'processing',
      createdAt: '2024-01-16T14:20:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful fetch responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ properties: mockProperties }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatches,
      });
  });

  describe('Component Rendering', () => {
    it('should render widget with properties', async () => {
      render(<ImportedPropertiesWidget />);

      // Should show loading initially
      expect(screen.getByText('נכסים מיובאים')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading skeleton

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
        expect(screen.getByText('Cozy House in Jerusalem')).toBeInTheDocument();
        expect(screen.getByText('Luxury Villa in Herzliya')).toBeInTheDocument();
      });
    });

    it('should render import statistics', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        // Total items: 10 + 5 = 15
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('סה"כ פריטים')).toBeInTheDocument();

        // Imported items: 8 + 3 = 11
        expect(screen.getByText('11')).toBeInTheDocument();
        expect(screen.getByText('יובאו')).toBeInTheDocument();

        // Completed batches: 1
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('יבואים הושלמו')).toBeInTheDocument();
      });
    });

    it('should display property details correctly', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const property1 = screen.getByText('Modern Apartment in Tel Aviv').closest('div');
        expect(property1).toHaveTextContent('123 Rothschild Blvd, Tel Aviv');
        expect(property1).toHaveTextContent('₪2,500,000');
        expect(property1).toHaveTextContent('YAD2');
        expect(property1).toHaveTextContent('ציון: 85');
        expect(property1).toHaveTextContent('מעולה');
      });
    });

    it('should render provider badges with correct colors', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const yad2Badge = screen.getAllByText('YAD2')[0];
        const madlanBadge = screen.getByText('MADLAN');

        expect(yad2Badge).toHaveClass('bg-blue-100', 'text-blue-800');
        expect(madlanBadge).toHaveClass('bg-purple-100', 'text-purple-800');
      });
    });

    it('should display AI score with appropriate colors', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const excellentScore = screen.getByText('ציון: 85');
        const goodScore = screen.getByText('ציון: 72');
        const fairScore = screen.getByText('ציון: 45');

        expect(excellentScore).toHaveClass('text-green-600');
        expect(goodScore).toHaveClass('text-blue-600');
        expect(fairScore).toHaveClass('text-yellow-600');
      });
    });

    it('should display AI categories in Hebrew', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('מעולה')).toBeInTheDocument(); // excellent
        expect(screen.getByText('טוב')).toBeInTheDocument(); // good
        expect(screen.getByText('בסדר')).toBeInTheDocument(); // fair
      });
    });
  });

  describe('Filtering Functionality', () => {
    it('should have filter dropdown with correct options', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const filterSelect = screen.getByRole('combobox');
        expect(filterSelect).toBeInTheDocument();

        expect(screen.getByText('כל המקורות')).toBeInTheDocument();
        expect(screen.getByText('יד2')).toBeInTheDocument();
        expect(screen.getByText('מדלן')).toBeInTheDocument();
      });
    });

    it('should filter properties by YAD2 provider', async () => {
      render(<ImportedPropertiesWidget />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
      });

      // Clear the mock and set up new response for YAD2 filter
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: mockProperties.filter(p => p.provider === 'YAD2'),
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBatches,
        });

      // Change filter to YAD2
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'YAD2' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('provider=YAD2')
        );
      });
    });

    it('should filter properties by MADLAN provider', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
      });

      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: mockProperties.filter(p => p.provider === 'MADLAN'),
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBatches,
        });

      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'MADLAN' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('provider=MADLAN')
        );
      });
    });

    it('should reset to all sources filter', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
      });

      // First filter by YAD2
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'YAD2' } });

      await waitFor(() => {
        expect(filterSelect).toHaveValue('YAD2');
      });

      // Reset to all sources
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: mockProperties }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBatches,
        });

      fireEvent.change(filterSelect, { target: { value: 'all' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.not.stringContaining('provider=')
        );
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no properties', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('אין נכסים מיובאים עדיין')).toBeInTheDocument();
        expect(screen.getByText('השתמש במודול הייבוא להוספת נכסים')).toBeInTheDocument();
      });
    });

    it('should show empty statistics when no batches', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        // Should not show statistics section when no batches
        expect(screen.queryByText('סה"כ פריטים')).not.toBeInTheDocument();
      });
    });
  });

  describe('External Links', () => {
    it('should render external property links', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const externalLinks = screen.getAllByText('צפה במקור');
        expect(externalLinks).toHaveLength(3);

        expect(externalLinks[0]).toHaveAttribute('href', 'https://yad2.co.il/property/123');
        expect(externalLinks[0]).toHaveAttribute('target', '_blank');
        expect(externalLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should not render external link when URL is missing', async () => {
      const propertiesWithoutUrls = mockProperties.map(p => ({
        ...p,
        externalUrl: undefined,
      }));

      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: propertiesWithoutUrls }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBatches,
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.queryByText('צפה במקור')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should have action buttons', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('צפה בכל הנכסים')).toBeInTheDocument();
        expect(screen.getByText('יבא נכסים חדשים')).toBeInTheDocument();
      });
    });

    it('should open properties page when clicking view all', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const viewAllButton = screen.getByText('צפה בכל הנכסים');
        fireEvent.click(viewAllButton);

        expect(mockWindowOpen).toHaveBeenCalledWith(
          '/dashboard/real-estate/properties',
          '_blank'
        );
      });
    });

    it('should open import page when clicking import new', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const importButton = screen.getByText('יבא נכסים חדשים');
        fireEvent.click(importButton);

        expect(mockWindowOpen).toHaveBeenCalledWith(
          '/dashboard/real-estate/import',
          '_blank'
        );
      });
    });
  });

  describe('Price Formatting', () => {
    it('should format ILS prices correctly', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('₪2,500,000')).toBeInTheDocument();
        expect(screen.getByText('₪1,800,000')).toBeInTheDocument();
        expect(screen.getByText('₪5,000,000')).toBeInTheDocument();
      });
    });

    it('should format USD prices correctly', async () => {
      const usdProperties = [
        {
          ...mockProperties[0],
          price: 650000,
          currency: 'USD',
        },
      ];

      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: usdProperties }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('$650,000')).toBeInTheDocument();
      });
    });

    it('should handle missing prices gracefully', async () => {
      const propertiesWithoutPrices = [
        {
          ...mockProperties[0],
          price: 0,
        },
      ];

      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: propertiesWithoutPrices }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('₪0')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle properties fetch error gracefully', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching imported properties:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle batches fetch error gracefully', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: [] }),
        })
        .mockRejectedValueOnce(new Error('Batches fetch failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching import batches:',
          expect.any(Error)
        );
      });

      // Should still stop loading
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle non-ok HTTP responses', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        // Should show empty state when API fails
        expect(screen.queryByText('Modern Apartment in Tel Aviv')).not.toBeInTheDocument();
      });
    });
  });

  describe('RTL Support', () => {
    it('should render Hebrew text correctly', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('נכסים מיובאים')).toBeInTheDocument();
        expect(screen.getByText('כל המקורות')).toBeInTheDocument();
        expect(screen.getByText('יד2')).toBeInTheDocument();
        expect(screen.getByText('מדלן')).toBeInTheDocument();
        expect(screen.getByText('סה"כ פריטים')).toBeInTheDocument();
        expect(screen.getByText('יובאו')).toBeInTheDocument();
        expect(screen.getByText('יבואים הושלמו')).toBeInTheDocument();
        expect(screen.getByText('צפה בכל הנכסים')).toBeInTheDocument();
        expect(screen.getByText('יבא נכסים חדשים')).toBeInTheDocument();
      });
    });

    it('should handle mixed Hebrew and English text', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        // Property names are in English, addresses and cities in mixed languages
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
        expect(screen.getByText('123 Rothschild Blvd, Tel Aviv')).toBeInTheDocument();
        expect(screen.getByText('YAD2')).toBeInTheDocument(); // Provider in English
        expect(screen.getByText('ציון: 85')).toBeInTheDocument(); // Score in Hebrew
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const filterSelect = screen.getByRole('combobox');
        expect(filterSelect).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);

        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
      });
    });

    it('should have proper loading state for screen readers', () => {
      render(<ImportedPropertiesWidget />);

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        const filterSelect = screen.getByRole('combobox');
        filterSelect.focus();
        expect(filterSelect).toHaveFocus();
      });
    });
  });

  describe('Performance', () => {
    it('should make proper API calls with correct parameters', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);

        // Properties API call
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/real-estate/properties?limit=10&sortBy=createdAt&sortOrder=desc'
        );

        // Batches API call
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/real-estate/properties/import/batches?limit=5'
        );
      });
    });

    it('should debounce filter changes', async () => {
      render(<ImportedPropertiesWidget />);

      await waitFor(() => {
        expect(screen.getByText('Modern Apartment in Tel Aviv')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');

      // Rapid filter changes
      fireEvent.change(filterSelect, { target: { value: 'YAD2' } });
      fireEvent.change(filterSelect, { target: { value: 'MADLAN' } });
      fireEvent.change(filterSelect, { target: { value: 'all' } });

      // Should not make excessive API calls due to rapid changes
      await waitFor(() => {
        // Should make calls for the final state
        expect(global.fetch).toHaveBeenCalledTimes(4); // Initial 2 + 2 more for final state
      });
    });
  });
});