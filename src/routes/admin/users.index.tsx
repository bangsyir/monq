import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { asc, count, desc, like, or, sql } from "drizzle-orm"
import { Edit, Eye, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { users } from "@/db/schema"

const UserQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.number().default(10),
  offset: z.number().default(0),
  sortBy: z.enum(["name", "email", "createdAt", "role"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})
type UserFilter = z.infer<typeof UserQuerySchema>
// Function to get total users count (cached separately)
const getTotalUsersCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db.select({ count: count() }).from(users)
    return result[0]?.count || 0
  },
)

const getUsersFn = createServerFn({ method: "GET" })
  .inputValidator(UserQuerySchema)
  .handler(async ({ data }) => {
    const { search, limit, offset, sortBy, sortOrder } = data

    // Build where conditions
    const whereConditions = search
      ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      : undefined

    // Optimize: Use a single query with subquery for better performance
    // This gets both the filtered count and the paginated results in one database round trip
    const query = db
      .select({
        // User fields
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: users.role,
        banned: users.banned,
        banReason: users.banReason,
        banExpires: users.banExpires,
        // Total count using window function
        totalCount: sql<number>`count(*) over()`.mapWith(Number),
      })
      .from(users)
      .where(whereConditions)

    // Determine sort column
    const sortColumn =
      sortBy === "name"
        ? users.name
        : sortBy === "email"
          ? users.email
          : sortBy === "role"
            ? users.role
            : users.createdAt

    // Apply ordering, pagination and execute
    const result = await query
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset)

    // Extract count from first row (all rows have the same total count)
    const totalCount = result[0]?.totalCount || 0

    return {
      users: result,
      totalCount,
      offset,
      hasMore: offset + limit < totalCount,
    }
  })
export const Route = createFileRoute("/admin/users/")({
  ssr: false,
  validateSearch: () => ({}) as UserFilter,
  loaderDeps: ({ search: { search, limit, offset, sortBy, sortOrder } }) => ({
    search,
    limit,
    offset,
    sortBy,
    sortOrder,
  }),
  loader: async ({ deps }) => {
    // Run both queries in parallel for better performance
    const [usersData, totalUsersCount] = await Promise.all([
      getUsersFn({ data: deps }),
      getTotalUsersCount(),
    ])

    return {
      ...usersData,
      totalUsersCount,
    }
  },
  component: RouteComponent,
  notFoundComponent: () => <div>Not Found</div>,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: "/admin/users" })
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

  const handleSort = (sortBy: "name" | "email" | "createdAt" | "role") => {
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

  const handleViewUser = (userId: string) => {
    navigate({ to: "/admin/users/$userId", params: { userId } })
  }

  const handleUpdateUser = (userId: string) => {
    navigate({ to: "/admin/users/$userId/update", params: { userId } })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Users</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Users: {data.totalUsersCount || data.totalCount}</span>
          {search.search && <span>Filtered Results: {data.totalCount}</span>}
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      <Table>
        <TableCaption>A list of all users in the system.</TableCaption>
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
              onClick={() => handleSort("email")}
            >
              Email{" "}
              {search.sortBy === "email" &&
                (search.sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("role")}
            >
              Role{" "}
              {search.sortBy === "role" &&
                (search.sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Created{" "}
              {search.sortBy === "createdAt" &&
                (search.sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role || "user"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    user.banned
                      ? "bg-red-100 text-red-800"
                      : user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.banned
                    ? "Banned"
                    : user.emailVerified
                      ? "Verified"
                      : "Pending"}
                </span>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" className="h-8 w-8 p-0" />}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateUser(user.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
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
