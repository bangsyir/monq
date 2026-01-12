import React from "react"
import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Grid2x2, MapPin, SlidersHorizontal } from "lucide-react"
import AddPlaceDialog from "@/components/add-place-component"
import CategoryFilter from "@/components/category-filter"
import PlaceCard from "@/components/place-card"
import PlacesMap from "@/components/places-map"
import { Button } from "@/components/ui/button"
import { mockPlaces } from "@/data/mock-places"

export const Route = createFileRoute("/places/")({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      cat: (search.cat as string) || "all",
    }
  },
  loaderDeps: ({ search: { cat } }) => ({ cat }),
  loader: ({ deps: { cat } }) => {
    if (cat === "" || cat === "all") {
      return {
        selectedCategory: "all",
        places: mockPlaces,
      }
    }
    return {
      selectedCategory: cat,
      places: mockPlaces.filter((places) => places.category === cat),
    }
  },
})

function RouteComponent() {
  const { selectedCategory, places } = Route.useLoaderData()
  const [view, setView] = React.useState<"grid" | "map">("grid")

  return (
    <>
      {/* Category Filter */}
      <div className="fixed left-0 right-0 bg-background/95 backdrop-blur-md z-40 border-b border-border">
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
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
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
                <SlidersHorizontal className="w-4 h-4" />
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
                    <Grid2x2 className="w-4 h-4" />
                    Show grid
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    Show map
                  </>
                )}
              </Button>
              <AddPlaceDialog />
            </div>
          </motion.div>
          {view === "grid" ? (
            <>
              {/* Places Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {places.map((place, index) => (
                  <PlaceCard key={place.id} place={place} index={index} />
                ))}
              </div>

              {/* Empty State */}
              {places.length === 0 && (
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
                    Try selecting a different category to discover more hidden
                    gems.
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            <ClientOnly fallback={<div>loading...</div>}>
              <PlacesMap places={places} onClose={setView} />
            </ClientOnly>
          )}
        </div>
      </main>
    </>
  )
}
