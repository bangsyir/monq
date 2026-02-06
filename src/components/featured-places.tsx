import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import PlaceCard from "./place-card"
import type { Place } from "@/types/place"
import { Button } from "@/components/ui/button"
import { getFeaturedPlaces } from "@/modules/places"

const FeaturedPlaces = () => {
  const getFeaturedPlacesFn = useServerFn(getFeaturedPlaces)

  const { data: featuredPlaces, isLoading } = useQuery({
    queryKey: ["featured-places"],
    queryFn: () => getFeaturedPlacesFn({ data: 8 }),
  })

  // Don't show component if no featured places
  if (!isLoading && (!featuredPlaces || featuredPlaces.length === 0)) {
    return null
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h2 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
              Featured Hidden Gems
            </h2>
            <p className="text-muted-foreground text-lg">
              Handpicked destinations that will take your breath away
            </p>
          </div>
          <Link to="/places" search={{ cat: "all" }}>
            <Button variant="outline" className="gap-2">
              View all places
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted aspect-[4/3] animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlaces?.map((place: Place, index: number) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedPlaces
