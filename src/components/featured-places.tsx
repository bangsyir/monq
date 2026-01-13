import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockPlaces } from "@/data/mock-places";
import PlaceCard from "./place-card";

const FeaturedPlaces = () => {
	const featuredPlaces = mockPlaces
		.filter((place) => place.isFeatured)
		.slice(0, 4);

	return (
		<section className="bg-background py-20">
			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
				>
					<div>
						<h2 className="mb-2 font-bold text-3xl text-foreground md:text-4xl">
							Featured Hidden Gems
						</h2>
						<p className="text-lg text-muted-foreground">
							Handpicked destinations that will take your breath away
						</p>
					</div>
					<Link to="/places" search={{ cat: "all" }}>
						<Button variant="outline" className="gap-2">
							View all places
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</motion.div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{featuredPlaces.map((place, index) => (
						<PlaceCard key={place.id} place={place} index={index} />
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedPlaces;
