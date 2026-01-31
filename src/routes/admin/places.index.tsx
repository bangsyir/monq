import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { asc, count, desc, like, or, sql } from "drizzle-orm"
import { Edit, Image, MapPin, MoreHorizontal, Star } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
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
import { db } from "@/db"
import { places } from "@/db/schema"
import { cn } from "@/lib/utils"

const PlaceQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.number().default(10),
  offset: z.number().default(0),
  sortBy: z.enum(["name", "rating", "createdAt", "city"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

type PlaceFilter = z.infer<typeof PlaceQuerySchema>

// Function to get total places count
const getTotalPlacesCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db.select({ count: count() }).from(places)
    return result[0]?.count || 0
  },
)

const getPlacesFn = createServerFn({ method: "GET" })
  .inputValidator(PlaceQuerySchema)
  .handler(async ({ data }) => {
    const { search, limit, offset, sortBy, sortOrder } = data

    // Build where conditions
    const whereConditions = search
      ? or(
          like(places.name, `%${search}%`),
          like(places.description, `%${search}%`),
          like(places.city, `%${search}%`),
          like(places.stateProvince, `%${search}%`),
          like(places.country, `%${search}%`),
        )
      : undefined

    // Optimize: Use a single query with subquery for better performance
    const query = db
      .select({
        // Place fields
        id: places.id,
        name: places.name,
        description: places.description,
        latitude: places.latitude,
        longitude: places.longitude,
        address: places.streetAddress,
        city: places.city,
        state: places.stateProvince,
        country: places.country,
        rating: places.rating,
        reviewCount: places.reviewCount,
        difficulty: places.difficulty,
        duration: places.duration,
        distance: places.distance,
        elevation: places.elevation,
        bestSeason: places.bestSeason,
        isFeatured: places.isFeatured,
        createdAt: places.createdAt,
        updatedAt: places.updatedAt,
        userId: places.userId,
        // Total count using window function
        totalCount: sql<number>`count(*) over()`.mapWith(Number),
      })
      .from(places)
      .where(whereConditions)

    // Determine sort column
    const sortColumn =
      sortBy === "name"
        ? places.name
        : sortBy === "rating"
          ? places.rating
          : sortBy === "city"
            ? places.city
            : places.createdAt

    // Apply ordering, pagination and execute
    const result = await query
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset)

    // Extract count from first row (all rows have the same total count)
    const totalCount = result[0]?.totalCount || 0

    return {
      places: result,
      totalCount,
      offset,
      limit,
      hasMore: offset + limit < totalCount,
    }
  })

export const Route = createFileRoute("/admin/places/")({
  ssr: false,
  validateSearch: () => ({}) as PlaceFilter,
  loaderDeps: ({ search: { search, limit, offset, sortBy, sortOrder } }) => ({
    search,
    limit,
    offset,
    sortBy,
    sortOrder,
  }),
  loader: async ({ deps }) => {
    // Run both queries in parallel for better performance
    const [placesData, totalPlacesCount] = await Promise.all([
      getPlacesFn({ data: deps }),
      getTotalPlacesCount(),
    ])

    return {
      ...placesData,
      totalPlacesCount,
    }
  },
  component: RouteComponent,
  notFoundComponent: () => <div>Not Found</div>,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: "/admin/places" })
  const [searchInput, setSearchInput] = useState(search.search || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: {
        ...search,
        search: searchInput,
        offset: 0,
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

  const handlePageChange = (newOffset: number) => {
    navigate({
      search: {
        ...search,
        offset: newOffset,
      },
    })
  }

  const handleUpdatePlace = (placeId: string) => {
    navigate({ to: "/admin/places/$placeId/update", params: { placeId } })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Places</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              Total Places: {data.totalPlacesCount || data.totalCount}
            </span>
            {search.search && <span>Filtered Results: {data.totalCount}</span>}
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
          <Button type="submit">Search</Button>
        </div>
      </form>

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
          {data?.places?.map((place) => (
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
                      onClick={() => handleUpdatePlace(place.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Place
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={
                        <Link
                          to="/admin/places/$placeId/images"
                          params={{ placeId: place.id }}
                        />
                      }
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Edit Image
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
          Showing {search.offset + 1} to{" "}
          {Math.min(search.offset + search.limit, data.totalCount)} of{" "}
          {data.totalCount} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handlePageChange(Math.max(0, search.offset - search.limit))
            }
            disabled={data.offset === 0}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(search.offset + search.limit)}
            disabled={!data.hasMore}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
