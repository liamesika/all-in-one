# Smart Neighborhood Map Feature

## Overview

The Smart Neighborhood Map is an interactive, Google Maps-based feature that provides visual property exploration with AI-driven neighborhood insights and Points of Interest (POI) overlays.

## Features

### Core Functionality

1. **Interactive Map Display**
   - Google Maps JavaScript API integration
   - Property markers with custom styling based on AI scores
   - Click-to-view property details
   - Automatic bounds adjustment based on visible properties

2. **Property Markers**
   - Color-coded by AI score (Excellent: Teal, Good: Blue)
   - Info windows with property thumbnails
   - Direct links to full property details
   - Price, type, and basic property info display

3. **Smart Neighborhood Guide (POI)**
   - 7 POI categories: Schools, Supermarkets, Public Transport, Parks, Restaurants, Gyms, Hospitals
   - Toggle categories on/off
   - Color-coded markers for easy identification
   - Proximity-based clustering

4. **AI-Driven Neighborhood Insights**
   - Overall neighborhood score (0-100)
   - Detailed category scores:
     - Proximity Index
     - Education (schools)
     - Public Transport
     - Lifestyle (restaurants, entertainment)
     - Safety Index
   - Contextual AI recommendations

5. **Search & Filters**
   - Search by neighborhood or city
   - Filter by property type
   - Price range filtering
   - Minimum rating filter
   - Distance radius selector

6. **Mobile Responsive**
   - Full-height map on desktop
   - Collapsible sidebar on mobile
   - Touch-friendly controls
   - Responsive overlay positioning

7. **RTL Support**
   - Hebrew translation ready
   - RTL-aware UI components

## Setup Instructions

### 1. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional, for future enhancements)

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to your domains (recommended)
   - Add API restrictions (Maps JavaScript API, Places API)

5. Add the API key to `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 2. Database Setup

The feature uses the existing `Property` model from Prisma. Ensure your properties have:
- `ownerUid` (required)
- `status: 'PUBLISHED'` (only published properties are shown)
- Location data: `city`, `neighborhood`, `address`
- Basic details: `name`, `price` or `rentPriceMonthly`, `type`, `rooms`, `size`
- Optional: `aiScore` (for enhanced marker styling)
- Photos: At least one photo recommended for info windows

### 3. Running the Feature

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Ensure environment variables are set

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Navigate to: `/dashboard/real-estate/neighborhoods`

## Architecture

### Components

```
components/real-estate/neighborhoods/
├── MapContainer.tsx         # Main Google Maps wrapper
├── NeighborhoodSidebar.tsx  # AI scorecard sidebar
├── POIOverlay.tsx           # POI category selector
└── SearchFilterBar.tsx      # Search and filter controls
```

### API Routes

```
app/api/neighborhoods/
└── route.ts                 # GET endpoint for property data
```

### Page

```
app/dashboard/real-estate/neighborhoods/
├── page.tsx                 # Main neighborhoods page
└── README.md                # This file
```

## API Endpoints

### GET `/api/neighborhoods`

Returns all published properties with coordinates and metadata.

**Query Parameters:**
- `ownerUid` (required): User/organization identifier

**Response:**
```json
{
  "properties": [
    {
      "id": "string",
      "title": "string",
      "lat": number,
      "lng": number,
      "price": number | null,
      "transactionType": "SALE" | "RENT",
      "type": "string",
      "neighborhood": "string",
      "city": "string",
      "address": "string",
      "rooms": number | null,
      "size": number | null,
      "score": number,
      "imageUrl": "string | null"
    }
  ],
  "count": number
}
```

## Customization

### Map Styling

Edit map styles in `MapContainer.tsx` (lines ~95-115):
```typescript
styles: [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#0E1A2B' }],
  },
  // ... more styles
]
```

### POI Categories

Add/remove categories in `POIOverlay.tsx`:
```typescript
const categories: POICategory[] = [
  {
    id: 'schools',
    name: 'Schools',
    icon: <School className="w-4 h-4" />,
    color: '#4CAF50',
  },
  // ... add more
];
```

### Neighborhood Scoring

Modify scoring logic in `NeighborhoodSidebar.tsx` (`calculateNeighborhoodScore` function).

Currently uses mock scores. For production:
1. Create a backend service to calculate real scores
2. Call Google Places API for POI proximity
3. Integrate with crime/safety databases
4. Use property price trends for market analysis

## Performance Considerations

1. **Map Loading**
   - Google Maps script is lazy-loaded
   - Dynamic import prevents SSR issues
   - Debounced search input (300ms)

2. **Marker Clustering**
   - Consider implementing marker clustering for 100+ properties
   - Use `@googlemaps/markerclusterer` library

3. **API Rate Limits**
   - Google Places API has usage limits
   - Implement caching for POI results
   - Consider server-side POI fetching

4. **Mobile Performance**
   - Reduced marker detail on mobile
   - Lazy-load sidebar components
   - Touch-optimized controls

## Analytics

The feature fires Google Analytics events:
- `map_property_click` - When user clicks a property marker

Add more events in `MapContainer.tsx`:
```typescript
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('event', 'your_event_name', {
    // event data
  });
}
```

## Future Enhancements

1. **Geocoding Integration**
   - Auto-geocode property addresses on creation
   - Store lat/lng in database
   - Remove mock coordinate generation

2. **Advanced Filtering**
   - Draw custom search areas on map
   - Polygon-based neighborhood boundaries
   - Heatmap visualization for property density

3. **Real-time Updates**
   - WebSocket integration for live property updates
   - Real-time POI changes
   - Collaborative viewing

4. **Enhanced AI Insights**
   - Machine learning-based neighborhood scoring
   - Price prediction based on location
   - Investment opportunity highlighting

5. **Street View Integration**
   - Google Street View panorama
   - Virtual property tours

6. **Export & Sharing**
   - PDF export of neighborhood reports
   - Shareable map links with filters
   - Email neighborhood insights to clients

## Troubleshooting

### Map doesn't load
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Check browser console for API errors
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### No properties showing
- Check that properties have `status: 'PUBLISHED'`
- Verify `ownerUid` matches your user
- Check API endpoint returns data: `/api/neighborhoods?ownerUid=YOUR_UID`

### POIs not appearing
- Ensure Places API is enabled
- Check API key restrictions allow Places API
- Verify map bounds contain results

### Performance issues
- Reduce number of visible markers
- Implement marker clustering
- Optimize image sizes for property thumbnails

## License

This feature is part of the Effinity Real Estate platform.

## Support

For questions or issues, contact the development team.
