import { useForm } from "@tanstack/react-form";
import { MapPin, Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addPlaceSchema } from "@/schema/place-schema";
import { addPlace } from "@/serverFunction/place.function";
import type { PlaceCategory } from "@/types/place";
import { Label } from "./ui/label";

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

const AddPlaceDialog = () => {
	const [open, setOpen] = useState(false);
	const [images, setImages] = useState<Array<File>>([]);

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
			images: [] as Array<File> | null,
		},
		validators: {
			onSubmit: addPlaceSchema,
		},
		onSubmit: async ({ value }) => {
			value.images;

			console.log("Place data:", value);
			console.log("Images:", images);
			const insert = await addPlace({ data: value });
			toast.success(insert.message);
			setOpen(false);
			form.reset();
			setImages([]);
		},
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button className="gap-2" />}>
				<Plus className="h-4 w-4" />
				Add Place
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-primary" />
						Add a Hidden Gem
					</DialogTitle>
					<DialogDescription>
						Share a new hidden place with the community. Fill in the details
						below.
					</DialogDescription>
				</DialogHeader>

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
																<Badge
																	key={cat}
																	variant="secondary"
																	className="gap-1 pr-1"
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
																</Badge>
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

								<form.Field
									name="difficulty"
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
							</div>
						</div>

						{/* Location */}
						<div className="space-y-4">
							<h3 className="font-medium text-foreground text-sm">Location</h3>

							<form.Field
								name="address"
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
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<div className="grid grid-cols-3 gap-4">
								<form.Field
									name="city"
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
						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="duration"
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
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</div>
						<form.Field
							name="images"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Photos (Optional)
										</FieldLabel>
										<div className="rounded-lg border-2 border-border border-dashed p-6 text-center">
											<Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
											<p className="mb-2 text-muted-foreground text-sm">
												Drag and drop images or click to browse
											</p>

											<Input
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												aria-invalid={isInvalid}
												accept="image/*"
												type="file"
												multiple
												onChange={(e) => {
													const files = Array.from(e.target.files || []);
													field.handleChange(files);
													handleImageChange(e);
												}}
												className="mx-auto max-w-xs"
											/>
											{images.length > 0 && (
												<p className="mt-2 text-primary text-sm">
													{images.length} image(s) selected
												</p>
											)}
										</div>
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit">
							<Plus className="mr-2 h-4 w-4" />
							Add Place
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddPlaceDialog;
