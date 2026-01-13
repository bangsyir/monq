import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeroSection = () => {
	return (
		<section className="relative flex min-h-[30vh] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
			{/* Content */}
			<div className="container relative z-10 mx-auto px-4 pt-20 text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mx-auto max-w-3xl"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2"
					>
						<Compass className="h-5 w-5 text-primary" />
						<span className="font-medium text-foreground text-sm">
							Discover Nature's Best Kept Secrets
						</span>
					</motion.div>

					<h1 className="mb-6 font-bold text-4xl text-foreground tracking-tight md:text-5xl lg:text-6xl">
						Find Your Next
						<span className="block text-primary">Hidden Adventure</span>
					</h1>

					<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
						Explore breathtaking waterfalls, serene campsites, challenging
						trails, and secret spots.
					</p>

					{/* Search Box */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mx-auto max-w-xl"
					>
						<div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
							<div className="flex flex-col items-center gap-2 sm:flex-row">
								<div className="flex flex-1 items-center gap-3 rounded-xl bg-secondary px-4 py-3">
									<MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
									<input
										type="text"
										placeholder="Where do you want to explore?"
										className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
									/>
								</div>
								<Link to="/places" search={{ cat: "all" }}>
									<Button
										className={cn(
											"w-full gap-2 rounded-xl px-4 py-5 sm:w-auto",
										)}
									>
										<Search className="h-5 w-5" />
										Explore
									</Button>
								</Link>
							</div>
						</div>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
					>
						{[
							{ value: "500+", label: "Hidden Gems" },
							{ value: "50K+", label: "Explorers" },
							{ value: "4.9", label: "Avg Rating" },
						].map((stat) => (
							<div key={stat.label} className="text-center">
								<div className="font-bold text-3xl text-foreground md:text-4xl">
									{stat.value}
								</div>
								<div className="mt-1 text-muted-foreground text-sm">
									{stat.label}
								</div>
							</div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default HeroSection;
