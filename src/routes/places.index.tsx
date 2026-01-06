import CategoryFilter from "@/components/category-filter"
import PlaceCard from "@/components/place-card"
import { Button } from "@/components/ui/button"
import { mockPlaces } from "@/data/mock-places"
import { PlaceCategory } from "@/types/place"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { MapPin, SlidersHorizontal } from "lucide-react"
import React from "react"

export const Route = createFileRoute("/places/")({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedCategory, setSelectedCategory] = React.useState<
    PlaceCategory | "all"
  >("all")

  const filteredPlaces = React.useMemo(() => {
    if (selectedCategory === "all") return mockPlaces
    return mockPlaces.filter((place) => place.category === selectedCategory)
  }, [selectedCategory])
  return (
    <>
      {/* Category Filter */}
      <div className="fixed left-0 right-0 bg-background/95 backdrop-blur-md z-40 border-b border-border">
        <div className="container mx-auto">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedCategory === "all"
                  ? "All Hidden Gems"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredPlaces.length} places to explore
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" />
                Show map
              </Button>
            </div>
          </motion.div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaces.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredPlaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No places found
              </h2>
              <p className="text-muted-foreground">
                Try selecting a different category to discover more hidden gems.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
