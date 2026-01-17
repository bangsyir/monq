import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	const headers = await getRequestHeaders();
	const data = await auth.api.listUsers({
		query: {},
		headers: headers,
	});
	return data;
});
export const Route = createFileRoute("/admin/users")({
	ssr: false,
	loader: async () => {
		const data = getUsers();
		return data;
	},
	component: RouteComponent,
	notFoundComponent: () => <div>Not Found</div>,
});

function RouteComponent() {
	return <div>Hello "/admin/users"!</div>;
}
