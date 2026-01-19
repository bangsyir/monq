import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { places } from "@/db/schema";
import { authAdminMiddleware } from "@/lib/auth-middleware";

const getPlaceImagesFn = createServerFn({ method: "GET" })
	.middleware([authAdminMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: placeId }) => {
		const placeImages = await db.query.places.findFirst({
			where: eq(places.id, placeId),
			columns: {
				name: true,
				description: true,
			},
			with: {
				images: true,
			},
		});
		return placeImages;
	});

export const Route = createFileRoute("/admin/places/$placeId/images")({
	ssr: false,
	component: RouteComponent,
	loader: async ({ params }) => {
		const places = await getPlaceImagesFn({ data: params.placeId });
		return places;
	},
});

function RouteComponent() {
	const data = Route.useLoaderData();
	const navigate = useNavigate({ from: "/admin/places" });
	const handleBack = () => {
		navigate({ to: "/admin/places" });
	};
	return (
		<div>
			<Button variant="outline" onClick={handleBack} className="mt-5 mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Places
			</Button>
			<div className="mb-6">
				<h1 className="mb-2 font-bold text-2xl">Update Place</h1>
				<div className="flex gap-4 text-gray-600 text-sm">
					<span>Edit place information</span>
				</div>
			</div>
			<div>{data?.name}</div>
			<div>{data?.description}</div>
			{data?.images.length === 0 && <div>Image not available</div>}
			{data?.images.map((image) => (
				<img key={image.id} src={image.url} alt={image.alt || "alt image"} />
			))}
		</div>
	);
}
