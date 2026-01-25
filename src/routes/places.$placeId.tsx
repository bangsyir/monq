import { Link, createFileRoute, useParams } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Bike,
  Calendar,
  Car,
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
import { useState } from "react"
import type { PlaceComment } from "@/types/place"
import CommentCard from "@/components/comment-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { mockComments, mockPlaces } from "@/data/mock-places"
import ImageGallery from "@/components/image-gallery"

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

export const Route = createFileRoute("/places/$placeId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { placeId } = useParams({ from: "/places/$placeId" })
  const place = mockPlaces.find((p) => p.id === placeId)
  const [comments, setComments] = useState<Array<PlaceComment>>(
    mockComments[placeId] ?? [],
  )
  const [newComment, setNewComment] = useState("")

  // TODO: Implement actual authentication state
  const isLoggedIn = false

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: PlaceComment = {
        id: Date.now().toString(),
        userId: "user1",
        userName: "Guest User",
        userAvatar: "",
        comment: newComment,
        createdAt: new Date().toISOString(),
        replies: [],
      }
      setComments([comment, ...comments])
      setNewComment("")
    }
  }

  const handleReply = (commentId: string, replyText: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [
              ...(comment.replies || []),
              {
                id: Date.now().toString(),
                userId: "user1",
                userName: "Guest User",
                userAvatar: "",
                comment: replyText,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }
        return comment
      }),
    )
  }

  if (!place) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">
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
    <div>
      <main>
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/places" search={{ cat: "all" }}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to places
            </Button>
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
                          {place.location.city}, {place.location.state}
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
                {place.bestSeason && (
                  <div className="bg-secondary rounded-xl p-4">
                    <Calendar className="text-primary mb-2 h-6 w-6" />
                    <p className="text-muted-foreground text-sm">Best Season</p>
                    <p className="text-foreground font-semibold">
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
                  {place.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="bg-secondary flex items-center gap-3 rounded-lg p-3"
                    >
                      <div className="text-primary">
                        {amenityIcons[amenity.icon] || (
                          <div className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-foreground">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <Separator />

              {/* Comments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-foreground text-xl font-semibold">
                    Comments ({comments.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <Star className="fill-accent text-accent h-5 w-5" />
                    <span className="text-foreground font-semibold">
                      {place.rating}
                    </span>
                  </div>
                </div>

                {/* Add Comment */}
                <div className="bg-secondary mb-6 rounded-xl p-6">
                  <h3 className="text-foreground mb-4 font-semibold">
                    Leave a comment
                  </h3>
                  {isLoggedIn ? (
                    <>
                      <Textarea
                        placeholder="Share your thoughts..."
                        className="bg-background mb-4"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button onClick={handleAddComment}>Post Comment</Button>
                    </>
                  ) : (
                    <div className="bg-muted rounded-lg p-6 text-center">
                      <p className="text-muted-foreground mb-3">
                        Please log in to post a comment.
                      </p>
                      <button
                        type="button"
                        className="text-primary font-medium hover:underline"
                        onClick={() => alert("Future: Open login dialog")}
                      >
                        Log in to comment
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment List */}
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      index={index}
                      onReply={handleReply}
                      isLoggedIn={isLoggedIn} // TODO: Use actual auth state
                    />
                  ))}
                  {comments.length === 0 && (
                    <p className="text-muted-foreground py-8 text-center">
                      No comments yet. Be the first to share your thoughts!
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
                <div className="border-border bg-card shadow-card rounded-xl border p-6">
                  <h3 className="text-foreground mb-4 font-semibold">
                    Location
                  </h3>

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
                        <p className="text-foreground font-mono">
                          {place.location.latitude.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Longitude</p>
                        <p className="text-foreground font-mono">
                          {place.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Google Maps
                      </Button>
                    </a>
                    {place.categories.includes("hiking") && (
                      <a
                        href={`https://www.alltrails.com/search?q=${encodeURIComponent(place.name + " " + place.location.city + " " + place.location.state)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          AllTrails
                        </Button>
                      </a>
                    )}
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
