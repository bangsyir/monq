# Map Route Documentation

## Overview

The `/map` route displays an interactive map with places that can be explored by panning and zooming. The route efficiently fetches only the places visible in the current map viewport.

## URL Search Parameters

| Parameter | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `lat`     | number | Center latitude of the map        |
| `lng`     | number | Center longitude of the map       |
| `zoom`    | number | Current zoom level (0-18+)        |
| `north`   | number | Northern boundary of visible area |
| `south`   | number | Southern boundary of visible area |
| `east`    | number | Eastern boundary of visible area  |
| `west`    | number | Western boundary of visible area  |

## Calculating Map Bounds

The core function `calculateBounds` determines the geographic boundaries of the visible map area based on center coordinates and zoom level:

```typescript
function calculateBounds(
  lng: number,
  lat: number,
  zoom: number,
): { north: number; south: number; east: number; west: number }
```

### How It Works

1. **Scale Calculation**: The scale is derived from zoom level using `Math.pow(2, zoom)`. Each zoom level doubles the map detail.

2. **Latitude Span**: `latDiff = 180 / scale`
   - At zoom 0: scale = 1, latDiff = 180° (entire world)
   - At zoom 1: scale = 2, latDiff = 90°
   - At zoom 12: scale = 4096, latDiff ≈ 0.044°

3. **Longitude Span**: `lngDiff = 360 / scale`
   - Same logic as latitude, but doubled because longitude spans 360°

4. **Boundary Calculation**:
   - `north` = `Math.min(90, lat + latDiff)`
   - `south` = `Math.max(-90, lat - latDiff)`
   - `east` = `Math.min(180, lng + lngDiff)`
   - `west` = `Math.max(-180, lng - lngDiff)`

### Why This Works for Any Screen Size

The bounds calculation is **independent of screen size** because:

- It uses **geographic coordinates** (degrees), not pixels
- The zoom level determines how much geographic area is visible
- Whether on mobile or desktop, the same zoom level shows the same geographic extent

The actual screen pixel dimensions are handled by the map library (MapLibre), which internally converts the zoom level to appropriate pixel coverage.

## Data Flow

```
1. User pans/zooms map
        ↓
2. handleViewportChange callback triggered
        ↓
3. Check if change exceeds threshold (lng/lat > 0.0001, zoom > 0.1)
        ↓
4. Get actual bounds from map instance (preferred)
   OR calculate bounds using calculateBounds()
        ↓
5. Update URL with new search params (lat, lng, zoom, north, south, east, west)
        ↓
6. TanStack Query detects bounds change → refetches places
        ↓
7. getPlacesByBounds server function queries DB for places within bounds
        ↓
8. Render places on map and sidebar
```

## Fetching Places

Places are fetched using TanStack Query with the bounds as the query key:

```typescript
const { data: places = [] } = useQuery({
  queryKey: ["places-by-bounds", bounds],
  queryFn: async () => {
    const result = await getPlacesByBoundsFn({ data: bounds })
    return result || []
  },
})
```

The `getPlacesByBounds` server function (from `@/modules/places`) queries the database for places where:

- `latitude BETWEEN south AND north`
- `longitude BETWEEN west AND east`

## Client-Side Filtering

After fetching places, there's an additional client-side filter for search:

```typescript
const filteredPlaces = places.filter(
  (place) =>
    place.name?.toLowerCase().includes(query) ||
    place.city?.toLowerCase().includes(query) ||
    place.streetAddress?.toLowerCase().includes(query),
)
```

This filters the already-fetched places by name, city, or street address.

## Viewport Update Threshold

To prevent excessive URL updates, changes are only applied when they exceed:

- Longitude: 0.0001 degrees
- Latitude: 0.0001 degrees
- Zoom: 0.1 levels

## Default Values

- **Default Center**: `[101.618645, 3.294886]` (Kuala Lumpur, Malaysia)
- **Default Zoom**: 12

## Place Click Behavior

When clicking a place in the sidebar or on the map, it navigates to that location with zoom level 15:

```typescript
const newBounds = calculateBounds(place.longitude, place.latitude, 15)
```

This centers the map on the selected place with high zoom detail.
