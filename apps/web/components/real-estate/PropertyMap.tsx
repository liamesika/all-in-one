'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface Property {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
}

export function PropertyMap({ properties, center }: { properties: Property[]; center?: [number, number] }) {
  const defaultCenter: [number, number] = center || [32.0853, 34.7818]; // Tel Aviv

  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <MapPin className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
          <Marker key={property.id} position={[property.lat, property.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{property.name}</h3>
                <p className="text-sm text-gray-600">₪{property.price.toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
