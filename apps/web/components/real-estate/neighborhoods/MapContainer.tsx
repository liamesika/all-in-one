'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export interface PropertyData {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number | null;
  transactionType: string;
  type: string | null;
  neighborhood: string | null;
  city: string | null;
  address: string | null;
  rooms: number | null;
  size: number | null;
  score: number;
  imageUrl: string | null;
}

export interface POICategory {
  id: string;
  name: string;
  icon: string;
  types: string[];
}

interface MapContainerProps {
  properties: PropertyData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyClick?: (property: PropertyData) => void;
  activePOICategories?: string[];
  filters?: {
    propertyType?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    minScore?: number | null;
    searchRadius?: number | null;
  };
}

export default function MapContainer({
  properties,
  center = { lat: 32.0853, lng: 34.7818 }, // Tel Aviv default
  zoom = 12,
  onPropertyClick,
  activePOICategories = [],
  filters,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const poiMarkersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter properties based on filters
  const filteredProperties = properties.filter((property) => {
    if (filters?.propertyType && property.type !== filters.propertyType) return false;
    if (filters?.minPrice && (property.price || 0) < filters.minPrice) return false;
    if (filters?.maxPrice && (property.price || 0) > filters.maxPrice) return false;
    if (filters?.minScore && property.score < filters.minScore) return false;
    return true;
  });

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setIsLoading(false);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!mapRef.current) return;

      try {
        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#0E1A2B' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#1a3a52' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#1e2d3d' }],
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
          ],
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        googleMapRef.current = map;
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [center, zoom]);

  // Update property markers
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    filteredProperties.forEach((property) => {
      if (!googleMapRef.current) return;

      const marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: googleMapRef.current,
        title: property.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: property.score >= 75 ? '#00FFD1' : '#2979FF',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: google.maps.Animation.DROP,
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(property),
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker);
        if (onPropertyClick) {
          onPropertyClick(property);
        }

        // Fire analytics event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'map_property_click', {
            property_id: property.id,
          });
        }
      });

      markersRef.current.push(marker);
    });

    // Adjust bounds if we have properties
    if (filteredProperties.length > 0 && googleMapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      filteredProperties.forEach((property) => {
        bounds.extend({ lat: property.lat, lng: property.lng });
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [filteredProperties, onPropertyClick]);

  // Update POI markers
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing POI markers
    poiMarkersRef.current.forEach((marker) => marker.setMap(null));
    poiMarkersRef.current = [];

    if (activePOICategories.length === 0) return;

    const map = googleMapRef.current;
    const service = new google.maps.places.PlacesService(map);
    const bounds = map.getBounds();

    if (!bounds) return;

    // POI category mapping
    const categoryTypes: Record<string, string[]> = {
      schools: ['school'],
      supermarkets: ['supermarket', 'grocery_or_supermarket'],
      transport: ['bus_station', 'subway_station', 'train_station', 'transit_station'],
      parks: ['park'],
      restaurants: ['restaurant', 'cafe'],
      gyms: ['gym'],
      hospitals: ['hospital', 'doctor'],
    };

    activePOICategories.forEach((category) => {
      const types = categoryTypes[category] || [];

      types.forEach((type) => {
        const request = {
          bounds,
          type,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 20).forEach((place) => {
              if (!place.geometry?.location || !googleMapRef.current) return;

              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: googleMapRef.current,
                title: place.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: getCategoryColor(category),
                  fillOpacity: 0.7,
                  strokeColor: '#ffffff',
                  strokeWeight: 1,
                },
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `<div style="padding: 8px;"><strong>${place.name}</strong><br/><small>${category}</small></div>`,
              });

              marker.addListener('click', () => {
                infoWindow.open(googleMapRef.current!, marker);
              });

              poiMarkersRef.current.push(marker);
            });
          }
        });
      });
    });
  }, [activePOICategories]);

  const createInfoWindowContent = (property: PropertyData) => {
    const priceDisplay = property.price
      ? `₪${property.price.toLocaleString()}`
      : 'N/A';

    const typeDisplay = property.transactionType === 'SALE' ? 'For Sale' : 'For Rent';

    return `
      <div style="padding: 12px; max-width: 250px;">
        ${property.imageUrl ? `<img src="${property.imageUrl}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #1a1a1a;">${property.title}</h3>
        <p style="margin: 0 0 4px; font-size: 14px; color: #2979FF; font-weight: 600;">${priceDisplay} - ${typeDisplay}</p>
        ${property.rooms ? `<p style="margin: 0 0 4px; font-size: 12px; color: #666;">${property.rooms} rooms</p>` : ''}
        ${property.size ? `<p style="margin: 0 0 4px; font-size: 12px; color: #666;">${property.size} sqm</p>` : ''}
        ${property.neighborhood ? `<p style="margin: 0 0 8px; font-size: 12px; color: #666;">${property.neighborhood}, ${property.city || ''}</p>` : ''}
        <a href="/dashboard/real-estate/properties/${property.id}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #2979FF; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">View Property</a>
      </div>
    `;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      schools: '#4CAF50',
      supermarkets: '#FF9800',
      transport: '#2196F3',
      parks: '#8BC34A',
      restaurants: '#F44336',
      gyms: '#9C27B0',
      hospitals: '#E91E63',
    };
    return colors[category] || '#757575';
  };

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-sm text-gray-400">Please check your configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-[#0E1A2B] rounded-lg flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-[#2979FF] animate-spin" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
