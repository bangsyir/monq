import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getPlaceById, updatePlace } from "@/serverFunction/place.function";
import type { PlaceCategory } from "@/types/place";

const categoryOptions: Array<{ value: PlaceCategory; label: string }> = [
	{ value: "waterfall", label: "Waterfall" },
	{ value: "campsite", label: "Campsite" },
	{ value: "hiking", label: "Hiking" },
	{ value: "trail", label: "Trail" },
	{ value: "lake", label: "Lake" },
	{ value: "mountain", label: "Mountain" },
];

const difficulties = [
	{ value: "easy", label: "Easy" },
	{ value: "moderate", label: "Moderate" },
	{ value: "hard", label: "Hard" },
	{ value: "expert", label: "Expert" },
];

export const Route = createFileRoute("/admin/places/$placeId/update")({
	ssr: false,
	loader: async ({ params }) => {
		const place = getPlaceById({ data: params.placeId });
		return place;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const place = Route.useLoaderData();
	const params = Route.useParams();
	const navigate = useNavigate({ from: "/admin/places" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [existingImages, setExistingImages] = useState<
		Array<{ id: string; url: string }>
	>([]);
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			categories: [] as Array<string>,
			address: "",
			city: "",
			state: "",
			country: "",
			latitude: "",
			longitude: "",
			difficulty: "",
			duration: "",
			distance: "",
		},

		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				const { ...rest } = value;
				const data = {
					...rest,
					images: [...(existingImages?.map((img) => img.url) || [])],
				};

				const update = await updatePlace({
					data: { id: params.placeId, ...data },
				});
				toast.success(update.message);
				navigate({ to: "/admin/places" });
			} catch (error) {
				console.error("Error updating place:", error);
				toast.error("Failed to update place");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

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

			<div className="max-w-2xl">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<FieldGroup>
						{/* Basic Info */}
						<div className="space-y-4">
							<form.Field
								name="name"
								defaultValue={place?.name}
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Place Name</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="e.g., Hidden Falls"
												defaultValue={field.state.value}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="description"
								defaultValue={place?.description}
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Description</FieldLabel>
											<Textarea
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Describe this hidden gem..."
												className="min-h-24"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="categories"
									defaultValue={place?.categories.map((c) => c.category)}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<div className="col-span-2 space-y-2">
												<Label>Categories (select multiple)</Label>
												<div className="space-y-3">
													{/* Selected categories */}
													{field.state.value.length > 0 && (
														<div className="flex flex-wrap gap-2">
															{field.state.value.map((cat) => (
																<div
																	key={cat}
																	className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground"
																>
																	{
																		categoryOptions.find((c) => c.value === cat)
																			?.label
																	}
																	<button
																		type="button"
																		onClick={() => {
																			field.handleChange(
																				field.state.value.filter(
																					(c) => c !== cat,
																				),
																			);
																		}}
																		className="ml-1 rounded-full p-0.5 hover:bg-muted"
																	>
																		<X className="h-3 w-3" />
																	</button>
																</div>
															))}
														</div>
													)}

													{/* Category selector */}
													<div className="flex flex-wrap gap-2">
														{categoryOptions
															.filter(
																(cat) => !field.state.value.includes(cat.value),
															)
															.map((cat) => (
																<Button
																	key={cat.value}
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={() => {
																		field.handleChange([
																			...field.state.value,
																			cat.value,
																		]);
																	}}
																	className="text-xs"
																>
																	+ {cat.label}
																</Button>
															))}
													</div>
												</div>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</div>
										);
									}}
								/>
							</div>
						</div>

						{/* Location */}
						<div className="space-y-4">
							<h3 className="font-medium text-foreground text-sm">Location</h3>

							<div className="grid grid-cols-3 gap-4">
								<form.Field
									name="address"
									defaultValue={place?.address || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Address</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Street address or landmark"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="city"
									defaultValue={place?.city || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>City</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="City"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="state"
									defaultValue={place?.state || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>State</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="State"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="country"
									defaultValue={place?.country || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Country</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="Country"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="latitude"
									defaultValue={place?.latitude?.toString() || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Latitude</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="e.g., 37.7749"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="longitude"
									defaultValue={place?.longitude?.toString() || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Longitude</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="e.g., -122.4194"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</div>
						</div>

						{/* Optional Details */}
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="difficulty"
									defaultValue={place?.difficulty || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Difficulty (Optional)
												</FieldLabel>
												<Select
													name={field.name}
													value={field.state.value}
													onValueChange={(value) =>
														field.handleChange(value ?? "")
													}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
													>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="">None</SelectItem>
														{difficulties.map((diff) => (
															<SelectItem key={diff.value} value={diff.value}>
																{diff.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="duration"
									defaultValue={place?.duration || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Duration (Optional)
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="e.g., 2-3 hours"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="distance"
									defaultValue={place?.distance || ""}
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Distance (Optional)
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="e.g., 5 miles"
													defaultValue={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</div>
						</div>

						{/* Images */}
						<div className="space-y-4">
							{/* Existing Images */}
							{place && place?.images.length > 0 && (
								<div className="space-y-2">
									<Label>Current Images</Label>
									<div className="grid grid-cols-3 gap-4">
										{place.images.map((image) => (
											<div key={image.id} className="group relative">
												<img
													src={image.url}
													alt={image.alt || "Place image"}
													className="h-24 w-full rounded-md border object-cover"
												/>
												<button
													type="button"
													onClick={() => {
														setExistingImages((prev) =>
															prev.filter((img) => img.id !== image.id),
														);
													}}
													className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
												>
													<Trash2 className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</FieldGroup>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/places" })}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="cursor-pointer"
						>
							{isSubmitting ? (
								<>
									<div className="h-4 w-4 animate-spin animate-spin rounded-full border-2 border-primary border-t-transparent border-r-transparent"></div>
									Updating...
								</>
							) : (
								<>
									<MapPin className="mr-2 h-4 w-4" />
									Update Place
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
