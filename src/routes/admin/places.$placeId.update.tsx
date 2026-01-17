import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/places/$placeId/update")({
	ssr: false,
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/places/$placeId/update"!</div>;
}
