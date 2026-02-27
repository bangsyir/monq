import {
  Await,
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { Edit, MapPin, MoreHorizontal, Star } from "lucide-react"
import { useState } from "react"
import { queryOptions } from "@tanstack/react-query"
import { PlacesLoadingSkeleton } from "./-components/places-loading-skeleton"
import type { PlaceFilter } from "@/modules/places"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getPlaces } from "@/modules/places"
import { Badge } from "@/components/reui/badge"

const placesQueryOptions = (data: PlaceFilter) =>
  queryOptions({
    queryKey: ["admin-places", data.page || 1, data.search],
    queryFn: () => getPlaces({ data: data }),
  })

export const Route = createFileRoute("/admin/places/")({
  validateSearch: () => ({}) as PlaceFilter,
  loaderDeps: ({ search: { search, page, sortBy, sortOrder } }) => ({
    search,
    page,
    sortBy,
    sortOrder,
  }),
  loader: ({ context, deps }) => {
    const places = context.queryClient.ensureQueryData(placesQueryOptions(deps))
    return {
      places,
    }
  },
  component: RouteComponent,
  notFoundComponent: () => <div>Not Found</div>,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { places } = Route.useLoaderData()

  const navigate = useNavigate({ from: "/admin/places/" })

  const [searchInput, setSearchInput] = useState(search.search || "")
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: {
        ...search,
        search: searchInput,
        page: 1,
      },
    })
  }

  const handleSort = (sortBy: "name" | "rating" | "createdAt" | "city") => {
    navigate({
      search: {
        ...search,
        sortBy,
        sortOrder:
          search.sortBy === sortBy && search.sortOrder === "asc"
            ? "desc"
            : "asc",
      },
    })
  }

  const handleNext = (currentPage: number) => {
    navigate({
      to: "/admin/places",
      search: {
        page: currentPage + 1,
      },
      resetScroll: true,
    })
  }

  const handlePrev = (currentPage: number) => {
    navigate({
      search: {
        page: currentPage - 1,
      },
      resetScroll: true,
    })
  }

  function DifficultyBadge({
    value,
  }: {
    value: "easy" | "moderate" | "hard" | "extreme"
  }) {
    switch (value) {
      case "easy":
        return <Badge variant="success-light">value</Badge>
      case "moderate":
        return <Badge variant="info-light">{value}</Badge>
      case "hard":
        return <Badge variant="warning-light">{value}</Badge>
      case "extreme":
        return <Badge variant="destructive-light">{value}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Places</h1>
          <Await
            promise={places}
            fallback={<div className="text-muted text-sm">Loading...</div>}
          >
            {(placesData) => (
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Total Places: {placesData.totalCount}</span>
                {search.search && (
                  <span>Filtered Results: {placesData.totalCount}</span>
                )}
              </div>
            )}
          </Await>
        </div>
        <div>
          <Link
            to="/admin/places/add"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Add place
          </Link>
        </div>
      </div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, description, location..."
          />
          <Button
            type="submit"
            className="bg-success hover:bg-success/90 rounded-md px-4 py-2 text-white transition-colors"
          >
            Search
          </Button>
        </div>
      </form>
      <Await promise={places} fallback={<PlacesLoadingSkeleton />}>
        {(placesData) => (
          <>
            <Table>
              <TableCaption>A list of all places in the system.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name{" "}
                    {search.sortBy === "name" &&
                      (search.sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("rating")}
                  >
                    Rating{" "}
                    {search.sortBy === "rating" &&
                      (search.sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("city")}
                  >
                    Location{" "}
                    {search.sortBy === "city" &&
                      (search.sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration/Distance</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created{" "}
                    {search.sortBy === "createdAt" &&
                      (search.sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer">Action </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placesData.places.map((place: any) => (
                  <TableRow key={place.id}>
                    <TableCell>
                      <div className="font-medium">{place.name}</div>
                      {place.description && (
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {place.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{place.rating?.toFixed(1) || "N/A"}</span>
                        {place.reviewCount > 0 && (
                          <span className="text-sm text-gray-500">
                            ({place.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {place.city && `${place.city}, `}
                          {place.state && `${place.state}, `}
                          {place.country}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {place.difficulty ? (
                        <DifficultyBadge value={place.difficulty} />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {place.duration && (
                          <div>Duration: {place.duration}</div>
                        )}
                        {place.distance && (
                          <div>Distance: {place.distance}</div>
                        )}
                        {place.elevation && (
                          <div>Elevation: {place.elevation}</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {new Date(place.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" className="h-8 w-8 p-0" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={
                              <Link
                                to={"/admin/places/$placeId/update"}
                                params={{ placeId: place.id }}
                              />
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Place
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {placesData.totalCount} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePrev(placesData.currentPage)}
                  disabled={!placesData.hasLeft}
                  className="hover:cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handleNext(placesData.currentPage)}
                  disabled={!placesData.hasMore}
                  className="hover:cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Await>
    </div>
  )
}
