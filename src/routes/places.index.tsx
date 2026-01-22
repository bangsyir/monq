import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Grid2x2, MapPin, SlidersHorizontal } from "lucide-react"
import React from "react"
import type { PlaceCategory } from "@/types/place"
import CategoryFilter from "@/components/category-filter"
import PlaceCard from "@/components/place-card"
import { PlaceExample } from "@/components/place-map"
import { Button } from "@/components/ui/button"
import { mockPlaces } from "@/data/mock-places"

type CategoryFilterType = {
  cat: string
}
export const Route = createFileRoute("/places/")({
  component: RouteComponent,
  validateSearch: () => ({}) as CategoryFilterType,
  loaderDeps: ({ search: { cat } }) => ({ cat }),
  loader: ({ deps: { cat } }) => {
    if (cat === undefined || cat === "all") {
      return {
        selectedCategory: "all",
        places: mockPlaces,
      }
    }
    return {
      selectedCategory: cat,
      places: mockPlaces.filter((places) =>
        places.categories.includes(cat as PlaceCategory),
      ),
    }
  },
})

function RouteComponent() {
  const { selectedCategory, places } = Route.useLoaderData()
  const [view, setView] = React.useState<"grid" | "map">("grid")

  return (
    <>
      {/* Category Filter */}
      <div className="border-border bg-background/95 fixed right-0 left-0 z-40 border-b backdrop-blur-md">
        <div className="container mx-auto">
          <CategoryFilter selectedCategory={selectedCategory} />
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
          >
            <div>
              <h1 className="text-foreground text-2xl font-bold md:text-3xl">
                {selectedCategory === "all"
                  ? "All Hidden Gems"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {places.length} places to explore
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  setView((prev) => (prev === "grid" ? "map" : "grid"))
                }
              >
                {view === "map" ? (
                  <>
                    <Grid2x2 className="h-4 w-4" />
                    Show grid
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Show map
                  </>
                )}
              </Button>
              {/* <AddPlaceDialog /> */}
            </div>
          </motion.div>
          {/* Places Grid */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {places.map((place, index) => (
                <PlaceCard key={place.id} place={place} index={index} />
              ))}
            </div>
          ) : (
            <PlaceExample />
          )}

          {/* Empty State */}
          {places.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <MapPin className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h2 className="text-foreground mb-2 text-xl font-semibold">
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
