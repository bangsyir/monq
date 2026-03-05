import { Link } from "@tanstack/react-router"
import { ExternalLink, ImageIcon } from "lucide-react"
import type { MapRef, MapViewport } from "@/components/ui/map"
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map"
import { buttonVariants } from "@/components/ui/button"

export function MapContent({
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
                  <div className="size-6 rounded-full border-2 border-white bg-emerald-500 shadow-lg" />
                </MarkerContent>
                <MarkerTooltip>{place.name}</MarkerTooltip>
                <MarkerPopup className="w-62 p-0">
                  {place.first_image?.url ? (
                    <div className="relative h-32 overflow-hidden rounded-t-md">
                      <img
                        src={place.first_image.url}
                        alt={place.name}
                        className="mb-2 h-32 w-full rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted flex h-32 items-center justify-center rounded-t-md">
                      <ImageIcon className="text-muted-foreground h-10 w-10" />
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
