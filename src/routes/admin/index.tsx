import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flag, LayoutDashboard, MapPin, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	ssr: false,
	component: RouteComponent,
});
// Mock data
const stats = [
	{ label: "Total Users", value: "2,847", change: "+12%", icon: Users },
	{ label: "Total Places", value: "156", change: "+8%", icon: MapPin },
	{ label: "Pending Reviews", value: "23", change: "-5%", icon: Flag },
	{ label: "Page Views", value: "45.2K", change: "+24%", icon: TrendingUp },
];
function RouteComponent() {
	return (
		<main className="pt-5">
			<Link to="/dashboard">dashboard</Link>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-8"
			>
				<div className="mb-2 flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<LayoutDashboard className="h-6 w-6 text-primary" />
					</div>
					<h1 className="font-bold text-2xl text-foreground md:text-3xl">
						Admin Dashboard
					</h1>
				</div>
				<p className="text-muted-foreground">
					Manage users, places, and reports
				</p>
			</motion.div>
			{/* Stats Grid */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				{stats.map((stat) => (
					<Card key={stat.label}>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">{stat.label}</p>
									<p className="font-bold text-2xl text-foreground">
										{stat.value}
									</p>
								</div>
								<div className="rounded-xl bg-primary/10 p-3">
									<stat.icon className="h-6 w-6 text-primary" />
								</div>
							</div>
							<div className="mt-2">
								<Badge
									variant={
										stat.change.startsWith("+") ? "default" : "secondary"
									}
								>
									{stat.change} this month
								</Badge>
							</div>
						</CardContent>
					</Card>
				))}
			</motion.div>
		</main>
	);
}
