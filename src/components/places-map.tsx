import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star, X } from "lucide-react";
import { toast } from "sonner";
import type { Place } from "@/types/place";
import { Button } from "./ui/button";
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
} from "./ui/map";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});
interface PlacesMapProps {
	places: Array<Place>;
	onClose: (value: "grid" | "map") => void;
}

const PlacesMap = ({ places, onClose }: PlacesMapProps) => {
	const [center, setCenter] = useState<[number, number] | null>(null);

	useEffect(() => {
		const calculatedCenter: [number, number] =
			places.length > 0
				? [
						places.reduce((sum, p) => sum + p.location.latitude, 0) /
							places.length,
						places.reduce((sum, p) => sum + p.location.longitude, 0) /
							places.length,
					]
				: [37.7749, -122.4194];
		setCenter(calculatedCenter);
	}, [places]);
	function ChangeView({ center }: { center: [number, number] }) {
		const map = useMap();
		map.setView(center, map.getZoom());
		return null;
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
				<div className="absolute top-0 right-0 left-0 z-[1000] border-border border-b bg-card/95 backdrop-blur-md">
					<div className="container mx-auto flex items-center justify-between px-4 py-3">
						<div className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-primary" />
							<span className="font-semibold text-foreground">
								{places.length} places on map
							</span>
						</div>
						<Button variant="ghost" size="icon" onClick={() => onClose("grid")}>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>

				{/* Map */}
				<div className="h-full w-full pt-14">
					<Map
						center={[38.76413333333334, -112.63473333333333]}
						zoom={5}
						attributionControl
						className="z-0 h-screen w-full"
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
								{places.map((place) => (
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
													className="h-32 w-full rounded-t-lg object-cover"
												/>
												<div className="p-3">
													<h3 className="font-semibold text-foreground">
														{place.name}
													</h3>
													<p className="text-muted-foreground text-sm">
														{place.location.city}, {place.location.state}
													</p>
													<div className="mt-2 flex items-center gap-1">
														<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
														<span className="font-medium text-sm">
															{place.rating}
														</span>
														<span className="text-muted-foreground text-sm">
															({place.reviewCount} reviews)
														</span>
													</div>
													<Link
														to={`/places/$placeId`}
														params={{ placeId: place.id }}
													>
														<Button size="sm" className="mt-3 w-full">
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
	);
};

export default PlacesMap;
