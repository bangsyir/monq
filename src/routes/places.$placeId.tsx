import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	Bike,
	Calendar,
	Car,
	Clock,
	Dog,
	Fish,
	Flame,
	Heart,
	MapPin,
	Mountain,
	Router,
	Share,
	Star,
	Tent,
	Waves,
} from "lucide-react";
import ReviewCard from "@/components/review-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { mockPlaces, mockReviews } from "@/data/mock-places";

const amenityIcons: Record<string, React.ReactNode> = {
	car: <Car className="h-5 w-5" />,
	toilet: (
		<div className="flex h-5 w-5 items-center justify-center text-xs">🚻</div>
	),
	waves: <Waves className="h-5 w-5" />,
	flame: <Flame className="h-5 w-5" />,
	table: (
		<div className="flex h-5 w-5 items-center justify-center text-xs">🪵</div>
	),
	sunrise: (
		<div className="flex h-5 w-5 items-center justify-center text-xs">🌅</div>
	),
	signpost: (
		<div className="flex h-5 w-5 items-center justify-center text-xs">🪧</div>
	),
	mountain: <Mountain className="h-5 w-5" />,
	dog: <Dog className="h-5 w-5" />,
	bike: <Bike className="h-5 w-5" />,
	sailboat: (
		<div className="flex h-5 w-5 items-center justify-center text-xs">🛶</div>
	),
	fish: <Fish className="h-5 w-5" />,
	tent: <Tent className="h-5 w-5" />,
	"mountain-snow": <Mountain className="h-5 w-5" />,
};

const difficultyColors: Record<string, string> = {
	easy: "bg-green-500 text-foreground",
	moderate: "bg-yellow-500 text-foreground",
	hard: "bg-accent text-accent-foreground",
	expert: "bg-destructive text-foreground",
};

export const Route = createFileRoute("/places/$placeId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { placeId } = useParams({ from: "/places/$placeId" });
	const place = mockPlaces.find((p) => p.id === placeId);
	const reviews = mockReviews[placeId] ?? [];

	if (!place) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-2 font-bold text-2xl text-foreground">
						Place not found
					</h1>
					<Link to="/places" search={{ cat: "all" }}>
						<Button>Back to places</Button>
					</Link>
				</div>
			</div>
		);
	}
	return (
		<div>
			<main>
				{/* Back Button */}
				<div className="container mx-auto px-4 py-4">
					<Link to="/places" search={{ cat: "all" }}>
						<Button variant="ghost" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back to places
						</Button>
					</Link>
				</div>

				{/* Image Gallery */}
				<div className="container mx-auto mb-8 px-4">
					<div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="aspect-4/3 md:aspect-square"
						>
							<img
								src={place.images[0]?.url}
								alt={place.name}
								className="h-full w-full object-cover"
							/>
						</motion.div>
						<div className="hidden grid-cols-2 gap-2 md:grid">
							{[...Array(4)].map((a, i) => (
								<motion.div
									key={a}
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: (i + 1) * 0.1 }}
									className="aspect-square bg-muted"
								>
									<img
										src={place.images[i % place.images.length]?.url}
										alt={place.name}
										className="h-full w-full object-cover"
									/>
								</motion.div>
							))}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="container mx-auto px-4 pb-20">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
						{/* Main Content */}
						<div className="space-y-8 lg:col-span-2">
							{/* Header */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
									<div>
										<h1 className="mb-2 font-bold text-3xl text-foreground md:text-4xl">
											{place.name}
										</h1>
										<div className="flex flex-wrap items-center gap-4 text-muted-foreground">
											<div className="flex items-center gap-1">
												<Star className="h-5 w-5 fill-accent text-accent" />
												<span className="font-semibold text-foreground">
													{place.rating}
												</span>
												<span>({place.reviewCount} reviews)</span>
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												<span>
													{place.location.city}, {place.location.state}
												</span>
											</div>
										</div>
									</div>
									<div className="flex gap-2">
										<Button variant="outline" size="icon">
											<Share className="h-5 w-5" />
										</Button>
										<Button variant="outline" size="icon">
											<Heart className="h-5 w-5" />
										</Button>
									</div>
								</div>

								{place.difficulty && (
									<Badge
										className={`${difficultyColors[place.difficulty]} mb-4`}
									>
										{place.difficulty.charAt(0).toUpperCase() +
											place.difficulty.slice(1)}{" "}
										Difficulty
									</Badge>
								)}
							</motion.div>

							<Separator />

							{/* Quick Info */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="grid grid-cols-2 gap-4 md:grid-cols-4"
							>
								{place.distance && (
									<div className="rounded-xl bg-secondary p-4">
										<Router className="mb-2 h-6 w-6 text-primary" />
										<p className="text-muted-foreground text-sm">Distance</p>
										<p className="font-semibold text-foreground">
											{place.distance}
										</p>
									</div>
								)}
								{place.duration && (
									<div className="rounded-xl bg-secondary p-4">
										<Clock className="mb-2 h-6 w-6 text-primary" />
										<p className="text-muted-foreground text-sm">Duration</p>
										<p className="font-semibold text-foreground">
											{place.duration}
										</p>
									</div>
								)}
								{place.elevation && (
									<div className="rounded-xl bg-secondary p-4">
										<Mountain className="mb-2 h-6 w-6 text-primary" />
										<p className="text-muted-foreground text-sm">Elevation</p>
										<p className="font-semibold text-foreground">
											{place.elevation}
										</p>
									</div>
								)}
								{place.bestSeason && (
									<div className="rounded-xl bg-secondary p-4">
										<Calendar className="mb-2 h-6 w-6 text-primary" />
										<p className="text-muted-foreground text-sm">Best Season</p>
										<p className="font-semibold text-foreground">
											{place.bestSeason.join(", ")}
										</p>
									</div>
								)}
							</motion.div>

							<Separator />

							{/* Description */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
							>
								<h2 className="mb-4 font-semibold text-foreground text-xl">
									About this place
								</h2>
								<p className="text-foreground leading-relaxed">
									{place.description}
								</p>
							</motion.div>

							<Separator />

							{/* Amenities */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<h2 className="mb-4 font-semibold text-foreground text-xl">
									What this place offers
								</h2>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
									{place.amenities.map((amenity) => (
										<div
											key={amenity.id}
											className="flex items-center gap-3 rounded-lg bg-secondary p-3"
										>
											<div className="text-primary">
												{amenityIcons[amenity.icon] || (
													<div className="h-5 w-5" />
												)}
											</div>
											<span className="text-foreground">{amenity.name}</span>
										</div>
									))}
								</div>
							</motion.div>

							<Separator />

							{/* Reviews */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
							>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="font-semibold text-foreground text-xl">
										Reviews ({reviews.length})
									</h2>
									<div className="flex items-center gap-2">
										<Star className="h-5 w-5 fill-accent text-accent" />
										<span className="font-semibold text-foreground">
											{place.rating}
										</span>
									</div>
								</div>

								{/* Add Review */}
								<div className="mb-6 rounded-xl bg-secondary p-6">
									<h3 className="mb-4 font-semibold text-foreground">
										Write a review
									</h3>
									<div className="mb-4 flex gap-1">
										{[...Array(5)].map((a, _) => (
											<button
												type="button"
												key={a}
												className="p-1 transition-transform hover:scale-110"
											>
												<Star className="h-6 w-6 fill-muted text-muted hover:fill-accent hover:text-accent" />
											</button>
										))}
									</div>
									<Textarea
										placeholder="Share your experience..."
										className="mb-4 bg-background"
									/>
									<Button variant="nature">Submit Review</Button>
									<p className="mt-3 text-muted-foreground text-sm">
										Please log in to submit a review.
									</p>
								</div>

								{/* Review List */}
								<div className="space-y-4">
									{reviews.map((review, index) => (
										<ReviewCard key={review.id} review={review} index={index} />
									))}
									{reviews.length === 0 && (
										<p className="py-8 text-center text-muted-foreground">
											No reviews yet. Be the first to share your experience!
										</p>
									)}
								</div>
							</motion.div>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1">
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.3 }}
								className="sticky top-28 space-y-6"
							>
								{/* Location Card */}
								<div className="rounded-xl border border-border bg-card p-6 shadow-card">
									<h3 className="mb-4 font-semibold text-foreground">
										Location
									</h3>

									{/* Map Placeholder */}
									<div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted">
										<div className="text-center text-muted-foreground">
											<MapPin className="mx-auto mb-2 h-8 w-8" />
											<p className="text-sm">Map View</p>
										</div>
									</div>

									<div className="space-y-3 text-sm">
										<div className="flex items-start gap-2">
											<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-foreground">
													{place.location.address}
												</p>
												<p className="text-muted-foreground">
													{place.location.city}, {place.location.state},{" "}
													{place.location.country}
												</p>
											</div>
										</div>

										<Separator />

										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-muted-foreground">Latitude</p>
												<p className="font-mono text-foreground">
													{place.location.latitude.toFixed(4)}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground">Longitude</p>
												<p className="font-mono text-foreground">
													{place.location.longitude.toFixed(4)}
												</p>
											</div>
										</div>
									</div>

									<Button variant="nature" className="mt-4 w-full">
										Get Directions
									</Button>
								</div>

								{/* Weather Card */}
								<div className="rounded-xl border border-border bg-card p-6 shadow-card">
									<h3 className="mb-4 font-semibold text-foreground">
										Best Time to Visit
									</h3>
									{place.bestSeason && (
										<div className="flex flex-wrap gap-2">
											{place.bestSeason.map((season) => (
												<Badge key={season} variant="secondary">
													{season}
												</Badge>
											))}
										</div>
									)}
									<p className="mt-4 text-muted-foreground text-sm">
										Plan your visit during these seasons for the best
										experience.
									</p>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</main>

			{/* <Footer /> */}
		</div>
	);
}
