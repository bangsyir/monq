import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import type { Place } from "@/types/place";
import { Badge } from "@/components/ui/badge";

interface PlaceCardProps {
  place: Place;
  index?: number;
}
const categoryLabels: Record<string, string> = {
  waterfall: "Waterfall",
  campsite: "Campsite",
  hiking: "Hiking",
  trail: "Trail",
  lake: "Lake",
  mountain: "Mountain",
};
const difficultyColors: Record<string, string> = {
  easy: "bg-success border-success/20",
  moderate: "bg-warning border-warning/20",
  hard: "bg-accent border-accent/20",
  expert: "bg-destructive border-destructive/20",
};

const PlaceCard = ({ place, index = 0 }: PlaceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/places/$placeId`}
        params={{ placeId: place.id }}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-xl">
          {/* Image Container */}
          <div className="aspect-[4/3] overflow-hidden rounded-xl">
            <motion.img
              src={place.images[0]?.url}
              alt={place.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Favorite Button */}
          {/* <motion.button */}
          {/* 	className="absolute top-3 right-3 rounded-full bg-card/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-card" */}
          {/* 	whileHover={{ scale: 1.1 }} */}
          {/* 	whileTap={{ scale: 0.9 }} */}
          {/* 	onClick={(e) => { */}
          {/* 		e.preventDefault(); */}
          {/* 		e.stopPropagation(); */}
          {/* 	}} */}
          {/* > */}
          {/* 	<Heart className="h-5 w-5 text-foreground" /> */}
          {/* </motion.button> */}

          {/* Featured Badge */}
          {place.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-accent text-accent-foreground shadow-md">
                Featured
              </Badge>
            </div>
          )}

          {/* Difficulty Badge */}
          {place.difficulty && (
            <div className="absolute bottom-3 left-3">
              <Badge
                variant="outline"
                className={`${difficultyColors[place.difficulty]} backdrop-blur-sm`}
              >
                {place.difficulty.charAt(0).toUpperCase() +
                  place.difficulty.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
              {place.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              <span className="font-medium text-sm">{place.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1 text-sm">
              {place.location.city}, {place.location.state}
            </span>
          </div>
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {place.categories.slice(0, 3).map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="px-1.5 py-0 text-xs"
              >
                {categoryLabels[cat]}
              </Badge>
            ))}
            {place.categories.length > 3 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                +{place.categories.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            {place.distance && <span>{place.distance}</span>}
            {place.duration && <span>• {place.duration}</span>}
          </div>

          <p className="line-clamp-2 pt-1 text-muted-foreground text-sm">
            {place.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default PlaceCard;
