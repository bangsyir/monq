import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { useCallback, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { ChevronsLeft } from "lucide-react"
import { toast } from "sonner"
import { UserDropdown } from "./-components/user-dropdown"
import { MapContent } from "./-components/map-content"
import { MapSidebarContent } from "./-components/map-sidebar"
import type { MapRef, MapViewport } from "@/components/ui/map"

import { getPlacesByBounds } from "@/modules/places"
import { buttonVariants } from "@/components/ui/button"
import {
  Sidebar,
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
  loader: ({ context }) => {
    const user = context.user
    if (!user) {
      toast.error("You need to login")
      throw redirect({ to: "/places" })
    }
    return { user: { username: user?.username } }
  },
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
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
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="my-4" />
            <Link
              to="/places"
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronsLeft />
              Back to places
            </Link>
          </div>
          <UserDropdown username={user?.username} />
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
