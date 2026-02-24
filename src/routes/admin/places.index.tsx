import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { Edit, ImageIcon, MapPin, MoreHorizontal, Star } from "lucide-react"
import { useState } from "react"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import type { RegisteredRouter, RouteById } from "@tanstack/react-router"
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
import { PlacesLoadingSkeleton } from "@/components/places-loading-skeleton"

const placesQueryOptions = (data: PlaceFilter) =>
  queryOptions({
    queryKey: ["admin-places", data.page],
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
  loader: async ({ context, deps }) => {
    const placesData = await context.queryClient.ensureQueryData(
      placesQueryOptions(deps),
    )
    return {
      placesData,
    }
  },
  component: RouteComponent,
  pendingComponent: PlacesLoadingSkeleton,
  notFoundComponent: () => <div>Not Found</div>,
})

type PlacesDataType = RouteById<
  RegisteredRouter["routeTree"],
  "/admin/places/"
>["types"]["loaderData"]["placesData"]

function PlacesContent({
  placesData,
}: {
  placesData: Awaited<PlacesDataType>
}) {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: "/admin/places/" })

  const [searchInput, setSearchInput] = useState(search.search || "")
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: {
        ...search,
        search: searchInput,
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
    })
  }

  const handlePrev = (currentPage: number) => {
    navigate({
      search: {
        page: currentPage - 1,
      },
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Places</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total Places: {placesData.totalCount}</span>
            {search.search && (
              <span>Filtered Results: {placesData.totalCount}</span>
            )}
          </div>
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
      <Table>
        <TableCaption>A list of all places in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
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
          {placesData.places.map((place) => (
            <TableRow key={place.id}>
              <TableCell>
                {place.firstImage ? (
                  <img
                    src={place.firstImage.url}
                    alt={place.firstImage.alt || place.name}
                    className="h-16 w-24 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded-md bg-gray-100">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </TableCell>
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
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  {place.difficulty || "N/A"}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {place.duration && <div>Duration: {place.duration}</div>}
                  {place.distance && <div>Distance: {place.distance}</div>}
                  {place.elevation && <div>Elevation: {place.elevation}</div>}
                </div>
              </TableCell>

              <TableCell>
                {new Date(place.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" className="h-8 w-8 p-0" />}
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
      {/* Pagination Controls */}
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
  )
}

function RouteComponent() {
  const { search, page, sortBy, sortOrder } = Route.useSearch()
  const { data: placesData, isLoading } = useSuspenseQuery(
    placesQueryOptions({ search, page, sortBy, sortOrder }),
  )
  return (
    <div className="container mx-auto py-6">
      {isLoading ? (
        <PlacesLoadingSkeleton />
      ) : (
        <PlacesContent placesData={placesData} />
      )}
    </div>
  )
}
