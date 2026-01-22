import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/places")({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
