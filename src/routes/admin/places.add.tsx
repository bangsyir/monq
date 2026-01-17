import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/places/add")({
	ssr: false,
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/places/add"!</div>;
}
