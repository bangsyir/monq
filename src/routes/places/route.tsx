import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/places")({
  component: RouteComponent,
  loader: ({ context }) => {
    const user = context.user
    return { user: { username: user?.username, role: user?.role } }
  },
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  return (
    <div className="min-h-screen">
      <Navbar username={user?.username} role={user.role || undefined} />
      <Outlet />
    </div>
  )
}
