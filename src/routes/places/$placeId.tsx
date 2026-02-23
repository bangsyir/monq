import { Link, createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  Bike,
  Calendar,
  Car,
  ChevronsLeft,
  Clock,
  Dog,
  ExternalLink,
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
import { queryOptions } from "@tanstack/react-query"
import { CommentsComponent } from "./-components/comments"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ImageGallery from "@/components/image-gallery"
import { getPlaceByIdNoAuth } from "@/modules/places"

const amenityIcons: Record<string, React.ReactNode> = {
  car: <Car className="h-5 w-5" />,
  toilet: (
    <div className="flex h-5 w-5 items-center justify-center text-xs">🚻</div>
  ),
  waves: <Waves className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  table: (
    <div className="flex h-5 w-5 items-center justify-center text-xs">🪵</div>
  ),
  sunrise: (
    <div className="flex h-5 w-5 items-center justify-center text-xs">🌅</div>
  ),
  signpost: (
    <div className="flex h-5 w-5 items-center justify-center text-xs">🪧</div>
  ),
  mountain: <Mountain className="h-5 w-5" />,
  dog: <Dog className="h-5 w-5" />,
  bike: <Bike className="h-5 w-5" />,
  sailboat: (
    <div className="flex h-5 w-5 items-center justify-center text-xs">🛶</div>
  ),
  fish: <Fish className="h-5 w-5" />,
  tent: <Tent className="h-5 w-5" />,
  "mountain-snow": <Mountain className="h-5 w-5" />,
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500 text-foreground",
  moderate: "bg-yellow-500 text-foreground",
  hard: "bg-accent text-accent-foreground",
  expert: "bg-destructive text-foreground",
}

const getPlacesOptions = (placeId: string) =>
  queryOptions({
    queryKey: ["get-places", placeId],
    queryFn: () => getPlaceByIdNoAuth({ data: placeId }),
  })

export const Route = createFileRoute("/places/$placeId")({
  component: RouteComponent,
  loader: async ({ params: { placeId }, context }) => {
    const isLoggedIn = context.user !== null
    const currentUserId = context.user?.id
    const place = await context.queryClient.ensureQueryData(
      getPlacesOptions(placeId),
    )
    return { place, isLoggedIn, currentUserId }
  },
})

function RouteComponent() {
  const { place } = Route.useLoaderData()
  if (!place) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            Place not found
          </h1>
          <Link
            to="/places"
            search={{ cat: "all" }}
            className={buttonVariants({ variant: "ghost" })}
          >
            <ChevronsLeft className="h-5 w-5" />
            Back to places
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div>
      <main>
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/places"
            search={{ cat: "all" }}
            className={buttonVariants({ variant: "ghost" })}
          >
            <ChevronsLeft className="h-5 w-5" />
            Back to places
          </Link>
        </div>

        {/* Image Gallery */}
        <div className="container mx-auto mb-8 px-4">
          <ImageGallery images={place.images} placeName={place.name} />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
                      {place.name}
                    </h1>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="fill-accent text-accent h-5 w-5" />
                        <span className="text-foreground font-semibold">
                          {place.rating}
                        </span>
                        <span>({place.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {place.city}, {place.stateProvince}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-5 w-5" />
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {place.placeCategories.slice(0, 3).map((cat) => (
                    <Badge
                      key={cat.categoryId}
                      variant="secondary"
                      className="px-1.5 py-0 text-xs"
                    >
                      {cat.category.name}
                    </Badge>
                  ))}
                  {place.placeCategories.length > 3 && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                      +{place.placeCategories.length - 3}
                    </Badge>
                  )}
                </div>
              </motion.div>

              <Separator />

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
              >
                {place.distance && (
                  <div className="bg-secondary rounded-xl p-4">
                    <Router className="text-primary mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">Distance</p>
                    <p className="text-foreground font-semibold">
                      {place.distance}
                    </p>
                  </div>
                )}
                {place.duration && (
                  <div className="bg-secondary rounded-xl p-4">
                    <Clock className="text-primary mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">Duration</p>
                    <p className="text-foreground font-semibold">
                      {place.duration}
                    </p>
                  </div>
                )}
                {place.elevation && (
                  <div className="bg-secondary rounded-xl p-4">
                    <Mountain className="text-primary mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">Elevation</p>
                    <p className="text-foreground font-semibold">
                      {place.elevation}
                    </p>
                  </div>
                )}
                {place.bestSeason?.length !== 0 && (
                  <div className="bg-secondary rounded-xl p-4">
                    <Calendar className="text-primary mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">Best Season</p>
                    <p className="text-foreground font-semibold">
                      {place.bestSeason?.join(", ")}
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
                <h2 className="text-foreground mb-4 text-xl font-semibold">
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
                <h2 className="text-foreground mb-4 text-xl font-semibold">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {place?.amenities?.map((amenity) => (
                    <div
                      key={amenity}
                      className="bg-secondary flex items-center gap-3 rounded-lg p-3"
                    >
                      <div className="text-primary">
                        {amenityIcons[amenity] || <div className="h-5 w-5" />}
                      </div>
                      <span className="text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <Separator />

              {/* Comments */}
              <CommentsComponent />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-28 space-y-6"
              >
                {/* Card */}
                <div className="border-border bg-card shadow-card rounded-xl border p-6">
                  <h3 className="text-foreground mb-4 font-semibold"></h3>

                  {/* Map Placeholder */}
                  <div className="bg-muted mb-4 flex aspect-video items-center justify-center rounded-lg">
                    <div className="text-muted-foreground text-center">
                      <MapPin className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Map View</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-foreground">{place.streetAddress}</p>
                        <p className="text-muted-foreground">
                          {place.city}, {place.stateProvince}, {place.country}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">Latitude</p>
                        <p className="text-foreground font-mono">
                          {place.latitude?.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Longitude</p>
                        <p className="text-foreground font-mono">
                          {place.longitude?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Google Maps
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Weather Card */}
                <div className="border-border bg-card shadow-card rounded-xl border p-6">
                  <h3 className="text-foreground mb-4 font-semibold">
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
                  <p className="text-muted-foreground mt-4 text-sm">
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
  )
}
