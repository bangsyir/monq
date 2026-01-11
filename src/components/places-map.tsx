import "leaflet/dist/leaflet.css"

import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import L from "leaflet"
import { MapPin, Star, X } from "lucide-react"
import { useEffect,useState } from "react"
import { useMap } from "react-leaflet"
import { toast } from "sonner"


import { Button } from "./ui/button"
import {
  Map,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapLocateControl,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "./ui/map"
import type { Place } from "@/types/place"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})
interface PlacesMapProps {
  places: Array<Place>
  onClose: (value: "grid" | "map") => void
}

const PlacesMap = ({ places, onClose }: PlacesMapProps) => {
  const [center, setCenter] = useState<[number, number] | null>(null)

  useEffect(() => {
    const calculatedCenter: [number, number] =
      places && places.length > 0
        ? [
            places.reduce((sum, p) => sum + p.location.latitude, 0) /
              places.length,
            places.reduce((sum, p) => sum + p.location.longitude, 0) /
              places.length,
          ]
        : [37.7749, -122.4194]
    setCenter(calculatedCenter)
  }, [places])
  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    map.setView(center, map.getZoom())
    return null
  }
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {places.length} places on map
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onClose("grid")}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="w-full h-full pt-14">
          <Map
            center={[38.76413333333334, -112.63473333333333]}
            zoom={5}
            attributionControl
            className="h-screen w-full z-0"
          >
            {center && <ChangeView center={center} />}
            <MapLayers defaultLayerGroups={["Pin"]}>
              <MapLayersControl />
              <MapTileLayer />
              <MapTileLayer
                name="Satellite"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
              <MapLayerGroup name="Pin">
                {places?.map((place) => (
                  <MapMarker
                    key={place.id}
                    position={[
                      place.location.latitude,
                      place.location.longitude,
                    ]}
                    icon={<span className="text-4xl">📍</span>}
                  >
                    <MapPopup className="m-0">
                      <div className="w-64">
                        <img
                          src={place.images[0]?.url}
                          alt={place.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="p-3">
                          <h3 className="font-semibold text-foreground">
                            {place.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {place.location.city}, {place.location.state}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {place.rating}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({place.reviewCount} reviews)
                            </span>
                          </div>
                          <Link
                            to={`/places/$placeId`}
                            params={{ placeId: place.id }}
                          >
                            <Button size="sm" className="w-full mt-3">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </MapPopup>
                  </MapMarker>
                ))}
              </MapLayerGroup>
            </MapLayers>
            <div className="absolute right-1 bottom-20 grid gap-1">
              <MapLocateControl
                className="static"
                onLocationError={(error) => toast.error(error.message)}
              />
              <MapZoomControl className="static" />
            </div>
          </Map>
        </div>
      </motion.div>
    </div>
  )
}

export default PlacesMap
