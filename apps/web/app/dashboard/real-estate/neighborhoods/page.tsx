'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';
import { PropertyData } from '@/components/real-estate/neighborhoods/MapContainer';
import POIOverlay from '@/components/real-estate/neighborhoods/POIOverlay';
import SearchFilterBar from '@/components/real-estate/neighborhoods/SearchFilterBar';
import NeighborhoodSidebar from '@/components/real-estate/neighborhoods/NeighborhoodSidebar';

// Dynamic import to avoid SSR issues with Google Maps
const MapContainer = dynamic(
  () => import('@/components/real-estate/neighborhoods/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0E1A2B] rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2979FF] animate-spin" />
      </div>
    ),
  }
);

interface Filters {
  propertyType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minScore: number | null;
  searchRadius: number | null;
}

export default function NeighborhoodsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePOICategories, setActivePOICategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    propertyType: null,
    minPrice: null,
    maxPrice: null,
    minScore: null,
    searchRadius: null,
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 32.0853,
    lng: 34.7818,
  });

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
    getUserLocation();
  }, []);

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.city?.toLowerCase().includes(query) ||
          property.neighborhood?.toLowerCase().includes(query) ||
          property.address?.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const ownerUid = user?.uid || 'demo-user';

      const response = await fetch(`/api/neighborhoods?ownerUid=${ownerUid}`);

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
      setFilteredProperties(data.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location permission denied, using default center');
        }
      );
    }
  };

  const handlePropertyClick = (property: PropertyData) => {
    setSelectedProperty(property);
    setIsSidebarOpen(true);
  };

  const handleTogglePOICategory = (categoryId: string) => {
    setActivePOICategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchProperties}
            className="px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[#0E1A2B] overflow-hidden">
      {/* Page Header - Mobile */}
      <div className="md:hidden bg-[#0E1A2B] border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#2979FF]" />
          <h1 className="text-lg font-semibold text-white">Smart Neighborhood Map</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {filteredProperties.length} properties • {activePOICategories.length} POI categories
        </p>
      </div>

      {/* Desktop Header - Overlay */}
      <div className="hidden md:block absolute top-4 left-4 z-10 bg-[#0E1A2B]/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2979FF]/20 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#2979FF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Smart Neighborhood Map</h1>
            <p className="text-sm text-gray-400">
              {filteredProperties.length} properties available
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <SearchFilterBar
        onSearchChange={setSearchQuery}
        onFiltersChange={setFilters}
      />

      {/* POI Overlay */}
      <POIOverlay
        activeCategories={activePOICategories}
        onToggleCategory={handleTogglePOICategory}
      />

      {/* Map Container */}
      <div className="w-full h-full pt-16 md:pt-0">
        {isLoading ? (
          <div className="w-full h-full bg-[#0E1A2B] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#2979FF] animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading neighborhood map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            properties={filteredProperties}
            center={mapCenter}
            zoom={12}
            onPropertyClick={handlePropertyClick}
            activePOICategories={activePOICategories}
            filters={filters}
          />
        )}
      </div>

      {/* Neighborhood Sidebar */}
      <NeighborhoodSidebar
        property={selectedProperty}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Stats Footer - Mobile */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 bg-[#0E1A2B]/95 backdrop-blur-sm border-t border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-400">
            Showing <span className="text-white font-semibold">{filteredProperties.length}</span> properties
          </div>
          {activePOICategories.length > 0 && (
            <div className="flex items-center gap-1 text-[#00FFD1]">
              <div className="w-2 h-2 rounded-full bg-[#00FFD1]" />
              <span>{activePOICategories.length} POI active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
