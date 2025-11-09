'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Filters {
  propertyType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minScore: number | null;
  searchRadius: number | null;
}

interface SearchFilterBarProps {
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: Filters) => void;
}

export default function SearchFilterBar({ onSearchChange, onFiltersChange }: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    propertyType: null,
    minPrice: null,
    maxPrice: null,
    minScore: null,
    searchRadius: null,
  });

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, onSearchChange]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof Filters, value: string | number | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      propertyType: null,
      minPrice: null,
      maxPrice: null,
      minScore: null,
      searchRadius: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== null);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <div className="bg-[#0E1A2B]/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl">
        {/* Search Bar */}
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by neighborhood or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-[#2979FF] text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Property Type</label>
                <select
                  value={filters.propertyType || ''}
                  onChange={(e) =>
                    handleFilterChange('propertyType', e.target.value || null)
                  }
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                >
                  <option value="">All Types</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="DUPLEX">Duplex</option>
                  <option value="OFFICE">Office</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Min Price (₪)</label>
                <input
                  type="number"
                  placeholder="e.g., 1000000"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minPrice',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Price (₪)</label>
                <input
                  type="number"
                  placeholder="e.g., 5000000"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxPrice',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>

              {/* Neighborhood Rating */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Min Rating</label>
                <select
                  value={filters.minScore || ''}
                  onChange={(e) =>
                    handleFilterChange('minScore', e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                >
                  <option value="">Any Rating</option>
                  <option value="80">80+ (Excellent)</option>
                  <option value="60">60+ (Good)</option>
                  <option value="40">40+ (Fair)</option>
                </select>
              </div>

              {/* Search Radius */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Distance Radius: {filters.searchRadius ? `${filters.searchRadius}km` : 'Any'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={filters.searchRadius || 10}
                  onChange={(e) =>
                    handleFilterChange('searchRadius', Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2979FF]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1km</span>
                  <span>20km</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
