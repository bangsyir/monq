import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import PlaceCard from "./place-card"
import { mockPlaces } from "@/data/mock-places"
import { Button } from "@/components/ui/button"

const FeaturedPlaces = () => {
  const featuredPlaces = mockPlaces
    .filter((place) => place.isFeatured)
    .slice(0, 4)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Hidden Gems
            </h2>
            <p className="text-muted-foreground text-lg">
              Handpicked destinations that will take your breath away
            </p>
          </div>
          <Link to="/places" search={{ cat: "all" }}>
            <Button variant="outline" className="gap-2">
              View all places
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedPlaces
