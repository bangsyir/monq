import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/places/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/places/add"!</div>
}
