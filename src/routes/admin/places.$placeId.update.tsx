import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/places/$placeId/update')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/places/$placeId/update"!</div>
}
