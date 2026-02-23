import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  MapPin,
  Search,
  X,
} from "lucide-react"
import React from "react"
import CategoryFilter from "@/components/category-filter"
import PlaceCard from "@/components/place-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPlacesForIndex } from "@/modules/places"

type PlacesSearchFilter = {
  cat?: string
  search?: string
  page?: number
}

export const Route = createFileRoute("/places/")({
  component: RouteComponent,

  validateSearch: () => ({}) as PlacesSearchFilter,
  loaderDeps: ({ search: { cat, search, page } }) => ({ cat, search, page }),
  loader: async ({ context, deps: { cat, search, page } }) => {
    const category = cat === undefined || cat === "all" ? undefined : cat
    const searchQuery = search?.trim() || undefined
    const placesData = await getPlacesForIndex({
      data: { category, search: searchQuery, page: page || 1 },
    })
    const isLoggedIn = context.user !== null
    return {
      selectedCategory: cat || "all",
      searchQuery: search || "",
      placesData,
      isLoggedIn,
    }
  },
  errorComponent: ({ error }) => {
    return <div className="pt-20">{JSON.stringify(error.message)}</div>
  },
})

function RouteComponent() {
  const { selectedCategory, placesData, searchQuery, isLoggedIn } =
    Route.useLoaderData()
  const navigate = useNavigate({ from: "/places" })
  const search = Route.useSearch()
  const [searchInput, setSearchInput] = React.useState(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: { ...search, search: searchInput || undefined, page: 1 },
    })
  }

  const clearSearch = () => {
    setSearchInput("")
    navigate({
      search: { ...search, search: undefined, page: 1 },
    })
  }

  const handleNext = () => {
    navigate({
      search: { ...search, page: placesData.currentPage + 1 },
    })
  }

  const handlePrev = () => {
    navigate({
      search: { ...search, page: placesData.currentPage - 1 },
    })
  }

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
                {placesData.totalCount} places to explore
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search places..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-[200px] pr-9 pl-9"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      <X className="text-muted-foreground h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>
              <Link
                to="/map"
                preload={false}
                className={buttonVariants({
                  variant: "outline",
                  className: `flex items-center gap-1 ${!isLoggedIn && "text-muted-foreground hover:text-muted-foreground"}`,
                })}
              >
                <MapPin className="h-4 w-4" />
                Show map
                {!isLoggedIn && <Lock className="h-4 w-4" />}
              </Link>
            </div>
          </motion.div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {placesData.places.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>

          {/* Pagination Controls */}
          {placesData.totalPage > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Page {placesData.currentPage} of {placesData.totalPage}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!placesData.hasLeft}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!placesData.hasMore}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {placesData.places.length === 0 && (
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
                Try selecting a different category or adjusting your search.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
