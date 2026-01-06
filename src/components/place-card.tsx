import { motion } from "framer-motion"
import { Heart, Star, MapPin } from "lucide-react"
import { Place } from "@/types/place"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"

interface PlaceCardProps {
  place: Place
  index?: number
}

const difficultyColors: Record<string, string> = {
  easy: "bg-success/10 text-success border-success/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-accent/10 text-accent border-accent/20",
  expert: "bg-destructive/10 text-destructive border-destructive/20",
}

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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Favorite Button */}
          <motion.button
            className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-md hover:bg-card transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Heart className="w-5 h-5 text-foreground" />
          </motion.button>

          {/* Featured Badge */}
          {place.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-accent text-accent-foreground border-0 shadow-md">
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
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="text-sm font-medium">{place.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm line-clamp-1">
              {place.location.city}, {place.location.state}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {place.distance && <span>{place.distance}</span>}
            {place.duration && <span>• {place.duration}</span>}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
            {place.description}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default PlaceCard
