import { Link, createFileRoute, useParams } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Bike,
  Calendar,
  Car,
  Clock,
  Dog,
  Fish,
  Flame,
  Heart,
  MapPin,
  Mountain,
  Router,
  Share,
  Star,
  Tent,
  Waves,
} from "lucide-react"
import ReviewCard from "@/components/review-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { mockPlaces, mockReviews } from "@/data/mock-places"

const amenityIcons: Record<string, React.ReactNode> = {
  car: <Car className="w-5 h-5" />,
  toilet: (
    <div className="w-5 h-5 flex items-center justify-center text-xs">🚻</div>
  ),
  waves: <Waves className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  table: (
    <div className="w-5 h-5 flex items-center justify-center text-xs">🪵</div>
  ),
  sunrise: (
    <div className="w-5 h-5 flex items-center justify-center text-xs">🌅</div>
  ),
  signpost: (
    <div className="w-5 h-5 flex items-center justify-center text-xs">🪧</div>
  ),
  mountain: <Mountain className="w-5 h-5" />,
  dog: <Dog className="w-5 h-5" />,
  bike: <Bike className="w-5 h-5" />,
  sailboat: (
    <div className="w-5 h-5 flex items-center justify-center text-xs">🛶</div>
  ),
  fish: <Fish className="w-5 h-5" />,
  tent: <Tent className="w-5 h-5" />,
  "mountain-snow": <Mountain className="w-5 h-5" />,
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500 text-foreground",
  moderate: "bg-yellow-500 text-foreground",
  hard: "bg-accent text-accent-foreground",
  expert: "bg-destructive text-foreground",
}

export const Route = createFileRoute("/places/$placeId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { placeId } = useParams({ from: "/places/$placeId" })
  const place = mockPlaces.find((p) => p.id === placeId)
  const reviews = mockReviews[placeId] ?? []

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Place not found
          </h1>
          <Link to="/places" search={{ cat: "all" }}>
            <Button>Back to places</Button>
          </Link>
        </div>
      </div>
    )
  }
  return (
    <>
      <div>
        <main>
          {/* Back Button */}
          <div className="container mx-auto px-4 py-4">
            <Link to="/places" search={{ cat: "all" }}>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to places
              </Button>
            </Link>
          </div>

          {/* Image Gallery */}
          <div className="container mx-auto px-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-4/3 md:aspect-square"
              >
                <img
                  src={place.images[0]?.url}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="hidden md:grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i + 1) * 0.1 }}
                    className="aspect-square bg-muted"
                  >
                    <img
                      src={place.images[i % place.images.length]?.url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {place.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-accent text-accent" />
                          <span className="font-semibold text-foreground">
                            {place.rating}
                          </span>
                          <span>({place.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {place.location.city}, {place.location.state}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Share className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {place.difficulty && (
                    <Badge
                      className={`${difficultyColors[place.difficulty]} mb-4`}
                    >
                      {place.difficulty.charAt(0).toUpperCase() +
                        place.difficulty.slice(1)}{" "}
                      Difficulty
                    </Badge>
                  )}
                </motion.div>

                <Separator />

                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {place.distance && (
                    <div className="p-4 bg-secondary rounded-xl">
                      <Router className="w-6 h-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="font-semibold text-foreground">
                        {place.distance}
                      </p>
                    </div>
                  )}
                  {place.duration && (
                    <div className="p-4 bg-secondary rounded-xl">
                      <Clock className="w-6 h-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">
                        {place.duration}
                      </p>
                    </div>
                  )}
                  {place.elevation && (
                    <div className="p-4 bg-secondary rounded-xl">
                      <Mountain className="w-6 h-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Elevation</p>
                      <p className="font-semibold text-foreground">
                        {place.elevation}
                      </p>
                    </div>
                  )}
                  {place.bestSeason && (
                    <div className="p-4 bg-secondary rounded-xl">
                      <Calendar className="w-6 h-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Best Season
                      </p>
                      <p className="font-semibold text-foreground">
                        {place.bestSeason.join(", ")}
                      </p>
                    </div>
                  )}
                </motion.div>

                <Separator />

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    About this place
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    {place.description}
                  </p>
                </motion.div>

                <Separator />

                {/* Amenities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    What this place offers
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {place.amenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                      >
                        <div className="text-primary">
                          {amenityIcons[amenity.icon] || (
                            <div className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-foreground">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Separator />

                {/* Reviews */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Reviews ({reviews.length})
                    </h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">
                        {place.rating}
                      </span>
                    </div>
                  </div>

                  {/* Add Review */}
                  <div className="bg-secondary p-6 rounded-xl mb-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Write a review
                    </h3>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className="w-6 h-6 text-muted fill-muted hover:fill-accent hover:text-accent" />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      className="mb-4 bg-background"
                    />
                    <Button variant="nature">Submit Review</Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      Please log in to submit a review.
                    </p>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        index={index}
                      />
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sticky top-28 space-y-6"
                >
                  {/* Location Card */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                    <h3 className="font-semibold text-foreground mb-4">
                      Location
                    </h3>

                    {/* Map Placeholder */}
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Map View</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-foreground">
                            {place.location.address}
                          </p>
                          <p className="text-muted-foreground">
                            {place.location.city}, {place.location.state},{" "}
                            {place.location.country}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Latitude</p>
                          <p className="font-mono text-foreground">
                            {place.location.latitude.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Longitude</p>
                          <p className="font-mono text-foreground">
                            {place.location.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button variant="nature" className="w-full mt-4">
                      Get Directions
                    </Button>
                  </div>

                  {/* Weather Card */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                    <h3 className="font-semibold text-foreground mb-4">
                      Best Time to Visit
                    </h3>
                    {place.bestSeason && (
                      <div className="flex flex-wrap gap-2">
                        {place.bestSeason.map((season) => (
                          <Badge key={season} variant="secondary">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-4">
                      Plan your visit during these seasons for the best
                      experience.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* <Footer /> */}
      </div>
    </>
  )
}
