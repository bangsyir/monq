import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { ExternalLink, Search } from "lucide-react"
import type { MapRef, MapViewport } from "@/components/ui/map"
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map"
import { getPlacesByBounds } from "@/modules/places"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

type MapSearchParams = {
  lat?: number
  lng?: number
  zoom?: number
  north?: number
  south?: number
  east?: number
  west?: number
}

export const Route = createFileRoute("/map")({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      lat: search.lat ? Number(search.lat) : undefined,
      lng: search.lng ? Number(search.lng) : undefined,
      zoom: search.zoom ? Number(search.zoom) : undefined,
      north: search.north ? Number(search.north) : undefined,
      south: search.south ? Number(search.south) : undefined,
      east: search.east ? Number(search.east) : undefined,
      west: search.west ? Number(search.west) : undefined,
    } as MapSearchParams
  },
})

function MapSidebarContent({
  searchQuery,
  setSearchQuery,
  filteredPlaces,
  isLoading,
  onPlaceClick,
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filteredPlaces: Array<any>
  isLoading: boolean
  onPlaceClick: (place: any) => void
}) {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-3">
                  <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
                  <div className="bg-muted h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No places found" : "No places in this area"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map((place: any) => (
                <div
                  key={place.id}
                  className="hover:bg-accent cursor-pointer rounded-lg border p-3 transition-colors"
                  onClick={() => onPlaceClick(place)}
                >
                  <h3 className="font-medium">{place.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {place.streetAddress}, {place.city}
                  </p>
                  {place.rating && (
                    <p className="text-sm text-yellow-500">
                      {"★".repeat(Math.round(place.rating))}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
    </>
  )
}

function MapContent({
  mapRef,
  viewport,
  handleViewportChange,
  filteredPlaces,
}: {
  mapRef: React.RefObject<MapRef | null>
  viewport: Partial<MapViewport>
  handleViewportChange: (viewport: MapViewport) => void
  filteredPlaces: Array<any>
}) {
  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        theme="light"
        viewport={viewport}
        onViewportChange={handleViewportChange}
        className="h-full w-full"
      >
        {filteredPlaces.map(
          (place: any) =>
            place.latitude &&
            place.longitude && (
              <MapMarker
                key={place.id}
                longitude={Number(place.longitude)}
                latitude={Number(place.latitude)}
              >
                <MarkerContent>
                  <div className="text-primary-foreground flex size-5 h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-medium shadow-lg">
                    {place.name?.charAt(0).toUpperCase()}
                  </div>
                </MarkerContent>
                <MarkerPopup className="w-62 p-0">
                  {place.first_image?.url && (
                    <div className="relative h-32 overflow-hidden rounded-t-md">
                      <img
                        src={place.first_image.url}
                        alt={place.name}
                        className="mb-2 h-32 w-full rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2 p-3">
                    <h3 className="mb-1 font-semibold">{place.name}</h3>
                    <div className="flex-cols flex items-center">
                      <p className="text-muted-foreground mb-2 text-xs">
                        {place.streetAddress}, {place.city}
                      </p>
                    </div>

                    <div>
                      <Link
                        to="/places/$placeId"
                        params={{ placeId: place.id }}
                        className={buttonVariants({
                          variant: "default",
                          size: "sm",
                          className: "w-full",
                        })}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ),
        )}
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

function RouteComponent() {
  const navigate = useNavigate({ from: "/map" })
  const search = Route.useSearch()
  const getPlacesByBoundsFn = useServerFn(getPlacesByBounds)
  const mapRef = useRef<MapRef>(null)

  const [searchQuery, setSearchQuery] = useState("")

  const defaultCenter: [number, number] = [101.618645, 3.294886]
  const defaultZoom = 12

  function calculateBounds(
    lng: number,
    lat: number,
    zoom: number,
  ): { north: number; south: number; east: number; west: number } {
    const scale = Math.pow(2, zoom)
    const latDiff = 180 / scale
    const lngDiff = 360 / scale
    return {
      north: Math.min(90, lat + latDiff),
      south: Math.max(-90, lat - latDiff),
      east: Math.min(180, lng + lngDiff),
      west: Math.max(-180, lng - lngDiff),
    }
  }

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

  const bounds = useMemo(() => {
    if (search.north && search.south && search.east && search.west) {
      return {
        north: search.north,
        south: search.south,
        east: search.east,
        west: search.west,
      }
    }
    const lng = search.lng ?? defaultCenter[0]
    const lat = search.lat ?? defaultCenter[1]
    const zoom = search.zoom ?? defaultZoom
    return calculateBounds(lng, lat, zoom)
  }, [
    search.north,
    search.south,
    search.east,
    search.west,
    search.lng,
    search.lat,
    search.zoom,
  ])

  const { data: places = [], isLoading } = useQuery({
    queryKey: ["places-by-bounds", bounds],
    queryFn: async (): Promise<Array<any>> => {
      const result = await getPlacesByBoundsFn({ data: bounds })
      return (result as Array<any>) || []
    },
  })
  console.log(places)
  const filteredPlaces = useMemo(() => {
    if (!places) return []
    if (!searchQuery.trim()) return places
    const query = searchQuery.toLowerCase()
    return places.filter(
      (place: any) =>
        place.name?.toLowerCase().includes(query) ||
        place.city?.toLowerCase().includes(query) ||
        place.streetAddress?.toLowerCase().includes(query),
    )
  }, [places, searchQuery])

  const handleViewportChange = useCallback(
    (newViewport: MapViewport) => {
      const newLng = Number(newViewport.center[0].toFixed(6))
      const newLat = Number(newViewport.center[1].toFixed(6))
      const newZoom = Number(newViewport.zoom.toFixed(2))

      const currentLng = search.lng ?? defaultCenter[0]
      const currentLat = search.lat ?? defaultCenter[1]
      const currentZoom = search.zoom ?? defaultZoom

      const lngDiff = Math.abs(newLng - currentLng)
      const latDiff = Math.abs(newLat - currentLat)
      const zoomDiff = Math.abs(newZoom - currentZoom)

      if (lngDiff > 0.0001 || latDiff > 0.0001 || zoomDiff > 0.1) {
        let newBounds: {
          north: number
          south: number
          east: number
          west: number
        } | null = null

        const mapInstance = mapRef.current
        if (mapInstance) {
          try {
            const mapBounds = mapInstance.getBounds()
            if (mapBounds) {
              newBounds = {
                north: mapBounds.getNorth(),
                south: mapBounds.getSouth(),
                east: mapBounds.getEast(),
                west: mapBounds.getWest(),
              }
            }
          } catch {
            // ignore
          }
        }

        if (!newBounds) {
          newBounds = calculateBounds(newLng, newLat, newZoom)
        }

        navigate({
          search: {
            lat: newLat,
            lng: newLng,
            zoom: newZoom,
            ...newBounds,
          },
          replace: true,
        })
      }
    },
    [navigate, search.lat, search.lng, search.zoom],
  )

  const handlePlaceClick = useCallback(
    (place: any) => {
      if (place.latitude && place.longitude) {
        const newBounds = calculateBounds(place.longitude, place.latitude, 15)
        navigate({
          search: {
            lat: place.latitude,
            lng: place.longitude,
            zoom: 15,
            ...newBounds,
          },
        })
      }
    },
    [navigate],
  )

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar">
        <MapSidebarContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredPlaces={filteredPlaces}
          isLoading={isLoading}
          onPlaceClick={handlePlaceClick}
        />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="my-4" />
        </header>
        <MapContent
          mapRef={mapRef}
          viewport={viewport}
          handleViewportChange={handleViewportChange}
          filteredPlaces={filteredPlaces}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
