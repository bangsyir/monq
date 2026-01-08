import { Navbar } from "@/components/navbar"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/places")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <Outlet />
    </div>
  )
}
