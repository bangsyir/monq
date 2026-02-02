import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Edit, Eye, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import type { RegisteredRouter, RouteById } from "@tanstack/react-router"
import type { UserFilter } from "@/schema/user-schema"
import { Input } from "@/components/ui/input"
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
import { getUsersFn } from "@/serverFunction/user.function"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UsersLoadingSkeleton } from "@/components/users-loading-skeleton"

type UsersDataType = RouteById<
  RegisteredRouter["routeTree"],
  "/admin/users/"
>["types"]["loaderData"]["usersData"]

export const Route = createFileRoute("/admin/users/")({
  ssr: false,
  validateSearch: () => ({}) as UserFilter,
  loaderDeps: ({ search: { search, page, sortBy, sortOrder } }) => ({
    search,
    page,
    sortBy,
    sortOrder,
  }),
  loader: async ({ deps }) => {
    const usersDataPromise = await getUsersFn({ data: deps })
    return {
      usersData: usersDataPromise,
    }
  },
  component: RouteComponent,
  pendingComponent: UsersLoadingSkeleton,
  notFoundComponent: () => <div>Not Found</div>,
})

function UsersContent({ usersData }: { usersData: Awaited<UsersDataType> }) {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: "/admin/users/" })
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

  const handleViewUser = (userId: string) => {
    navigate({ to: "/admin/users/$userId", params: { userId } })
  }

  const handleUpdateUser = (userId: string) => {
    navigate({ to: "/admin/users/$userId/update", params: { userId } })
  }

  const handleNext = () => {
    navigate({
      to: "/admin/users",
      search: { page: usersData.currentPage + 1 },
    })
  }

  const handlePrev = () => {
    navigate({
      to: "/admin/users",
      search: { page: usersData.currentPage - 1 },
    })
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Users</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Users: {usersData.totalCount}</span>
          {search.search && (
            <span>Filtered Results: {usersData.totalCount}</span>
          )}
        </div>
      </div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
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
            <TableHead>Username</TableHead>
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
          {usersData.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.image && (
                  <Avatar>
                    <AvatarImage
                      src={user.image}
                      alt={user.username || "User"}
                      className="grayscale"
                    />
                    <AvatarFallback>
                      {user.username?.slice(0, 2) || "US"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
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
          {usersData.totalCount} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={!usersData.hasLeft}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!usersData.hasMore}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}

function RouteComponent() {
  const { usersData } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-6">
      <UsersContent usersData={usersData} />
    </div>
  )
}
