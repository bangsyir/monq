import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { placeImages, places } from "@/db/schema";
import { authAdminMiddleware } from "@/lib/auth-middleware";

const getPlaceImagesFn = createServerFn({ method: "GET" })
	.middleware([authAdminMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: placeId }) => {
		const placeImages = await db.query.places.findFirst({
			where: eq(places.id, placeId),
			columns: {
				id: true,
				name: true,
				description: true,
			},
			with: {
				images: true,
			},
		});
		return placeImages;
	});

const addPlaceImageFn = createServerFn({ method: "POST" })
	.middleware([authAdminMiddleware])
	.inputValidator(
		z.object({
			placeId: z.string(),
			url: z.string().url(),
			alt: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const newImage = await db
			.insert(placeImages)
			.values({
				placeId: data.placeId,
				url: data.url,
				alt: data.alt || null,
			})
			.returning();
		return newImage[0];
	});

const removePlaceImageFn = createServerFn({ method: "POST" })
	.middleware([authAdminMiddleware])
	.inputValidator(
		z.object({
			imageId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		await db.delete(placeImages).where(eq(placeImages.id, data.imageId));
		return { success: true };
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
	const place = Route.useLoaderData();
	const navigate = useNavigate({ from: "/admin/places" });
	const [newImageUrl, setNewImageUrl] = useState("");
	const [newImageAlt, setNewImageAlt] = useState("");
	const [isAddingImage, setIsAddingImage] = useState(false);

	const handleBack = () => {
		navigate({ to: "/admin/places" });
	};

	const handleAddImage = async () => {
		if (!newImageUrl || !place?.id) return;

		setIsAddingImage(true);
		try {
			await addPlaceImageFn({
				data: {
					placeId: place.id,
					url: newImageUrl,
					alt: newImageAlt,
				},
			});
			setNewImageUrl("");
			setNewImageAlt("");
			// Reload the page to show new images
			window.location.reload();
		} catch (error) {
			console.error("Failed to add image:", error);
		} finally {
			setIsAddingImage(false);
		}
	};

	const handleRemoveImage = async (imageId: string) => {
		if (!confirm("Are you sure you want to remove this image?")) return;

		try {
			await removePlaceImageFn({
				data: { imageId },
			});
			// Reload the page to show updated images
			window.location.reload();
		} catch (error) {
			console.error("Failed to remove image:", error);
		}
	};

	return (
		<div>
			<Button variant="outline" onClick={handleBack} className="mt-5 mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Places
			</Button>
			<div className="mb-6">
				<h1 className="mb-2 font-bold text-2xl">Manage Place Images</h1>
				<div className="flex gap-4 text-gray-600 text-sm">
					<span>Add or remove images for {place?.name}</span>
				</div>
			</div>
			<div className="flex flex-col gap-6">
				<div className="space-y-2">
					<div>{place?.name}</div>
					<div>{place?.description}</div>
				</div>

				{/* Add New Image Form */}
				<div className="space-y-4 rounded-lg border p-4">
					<Label>Add New Image</Label>
					<div className="space-y-3">
						<div>
							<Label htmlFor="image-url">Image URL</Label>
							<Input
								id="image-url"
								type="url"
								placeholder="https://example.com/image.jpg"
								value={newImageUrl}
								onChange={(e) => setNewImageUrl(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="image-alt">Alt Text (Optional)</Label>
							<Input
								id="image-alt"
								type="text"
								placeholder="Description of the image"
								value={newImageAlt}
								onChange={(e) => setNewImageAlt(e.target.value)}
							/>
						</div>
						<Button
							onClick={handleAddImage}
							disabled={!newImageUrl || isAddingImage}
							className="w-full"
						>
							<Upload className="mr-2 h-4 w-4" />
							{isAddingImage ? "Adding..." : "Add Image"}
						</Button>
					</div>
				</div>

				{/* Current Images */}
				{place && place?.images.length > 0 && (
					<div className="space-y-2">
						<Label>Current Images ({place.images.length})</Label>
						<div className="grid grid-cols-3 gap-4">
							{place.images.map((image) => (
								<div key={image.id} className="group relative">
									<img
										src={image.url}
										alt={image.alt || "Place image"}
										height={500}
										width={500}
										className="h-full w-full rounded-md border object-cover"
									/>
									<button
										type="button"
										onClick={() => handleRemoveImage(image.id)}
										className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
										title="Remove image"
									>
										<Trash2 className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{place && place?.images.length === 0 && (
					<div className="py-8 text-center text-gray-500">
						No images yet. Add your first image above.
					</div>
				)}
			</div>
		</div>
	);
}
