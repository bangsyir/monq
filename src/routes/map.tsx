import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import type { MapViewport } from "@/components/ui/map"
import { Map, MapControls } from "@/components/ui/map"

type MapSearchParams = {
  lat?: number
  lng?: number
  zoom?: number
}

export const Route = createFileRoute("/map")({
  component: RouteComponent,
  validateSearch: () => ({}) as MapSearchParams,
})

function RouteComponent() {
  const navigate = useNavigate({ from: "/map" })
  const search = Route.useSearch()

  // Default coordinates (Kuala Lumpur)
  const defaultCenter: [number, number] = [101.6869, 3.139]
  const defaultZoom = 12

  // Parse URL params or use defaults
  const viewport = useMemo(() => {
    const lng = search.lng ?? defaultCenter[0]
    const lat = search.lat ?? defaultCenter[1]
    const zoom = search.zoom ?? defaultZoom

    return {
      center: [lng, lat] as [number, number],
      zoom,
      bearing: 0,
      pitch: 0,
    } satisfies Partial<MapViewport>
  }, [search.lat, search.lng, search.zoom])

  // Update URL when viewport changes (debounced)
  const handleViewportChange = useCallback(
    (newViewport: MapViewport) => {
      // Only update if values changed significantly (avoid unnecessary URL updates)
      const newLng = Number(newViewport.center[0].toFixed(6))
      const newLat = Number(newViewport.center[1].toFixed(6))
      const newZoom = Number(newViewport.zoom.toFixed(2))

      // Check if values are different from current URL
      const currentLng = search.lng ?? defaultCenter[0]
      const currentLat = search.lat ?? defaultCenter[1]
      const currentZoom = search.zoom ?? defaultZoom

      const lngDiff = Math.abs(newLng - currentLng)
      const latDiff = Math.abs(newLat - currentLat)
      const zoomDiff = Math.abs(newZoom - currentZoom)

      // Only update if change is significant
      if (lngDiff > 0.0001 || latDiff > 0.0001 || zoomDiff > 0.1) {
        navigate({
          search: {
            lat: newLat,
            lng: newLng,
            zoom: newZoom,
          },
          replace: true, // Use replace to avoid cluttering history
        })
      }
    },
    [navigate, search.lat, search.lng, search.zoom],
  )

  return (
    <div className="fixed inset-0">
      <Map
        viewport={viewport}
        onViewportChange={handleViewportChange}
        className="h-full w-full"
      >
        <MapControls
          position="bottom-right"
          showZoom={true}
          showCompass={true}
          showLocate={true}
          showFullscreen={true}
        />
      </Map>
    </div>
  )
}
