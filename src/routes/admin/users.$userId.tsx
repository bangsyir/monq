import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { ArrowLeft, Ban, Calendar, Mail, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { users } from "@/db/schema";

const getUserFn = createServerFn({ method: "GET" }).handler(
	async ({ data }: { data: { userId: string } }) => {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, data.userId))
			.limit(1);

		return user[0] || null;
	},
);

export const Route = createFileRoute("/admin/users/$userId")({
	loader: async ({ params }) => {
		const user = await getUserFn({ data: { userId: params.userId } });
		return { user };
	},
	component: RouteComponent,
	notFoundComponent: () => <div>User not found</div>,
});

function RouteComponent() {
	const { user } = Route.useLoaderData();
	const navigate = useNavigate({ from: "/admin/users" });

	if (!user) {
		return <div>User not found</div>;
	}

	const handleBack = () => {
		navigate({ to: "/admin/users" });
	};

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<Button variant="ghost" onClick={handleBack} className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Users
				</Button>

				<h1 className="font-bold text-2xl">User Details</h1>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Profile Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-3">
							<Avatar className="h-12 w-12">
								<AvatarImage src={user.image || ""} alt={user.name} />
								<AvatarFallback>
									{user.name?.charAt(0)?.toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							{user.name}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<User className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Full Name:</span>
							<span>{user.name}</span>
						</div>

						<div className="flex items-center gap-3">
							<Mail className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Email:</span>
							<span>{user.email}</span>
						</div>

						<div className="flex items-center gap-3">
							<Shield className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Role:</span>
							<Badge
								variant={user.role === "admin" ? "destructive" : "secondary"}
							>
								{user.role || "user"}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Status & Activity Card */}
				<Card>
					<CardHeader>
						<CardTitle>Status & Activity</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Shield className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Email Verified:</span>
							<Badge variant={user.emailVerified ? "default" : "secondary"}>
								{user.emailVerified ? "Verified" : "Not Verified"}
							</Badge>
						</div>

						<div className="flex items-center gap-3">
							<Ban className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Account Status:</span>
							<Badge variant={user.banned ? "destructive" : "default"}>
								{user.banned ? "Banned" : "Active"}
							</Badge>
						</div>

						{user.banReason && (
							<div className="flex items-start gap-3">
								<Ban className="mt-1 h-4 w-4 text-gray-500" />
								<span className="font-medium">Ban Reason:</span>
								<span className="text-gray-600 text-sm">{user.banReason}</span>
							</div>
						)}

						{user.banExpires && (
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-gray-500" />
								<span className="font-medium">Ban Expires:</span>
								<span>{new Date(user.banExpires).toLocaleDateString()}</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Timestamps Card */}
				<Card>
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-gray-500" />
							<span className="font-medium">User ID:</span>
							<span className="font-mono text-gray-600 text-xs">{user.id}</span>
						</div>

						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Created:</span>
							<span>{new Date(user.createdAt).toLocaleString()}</span>
						</div>

						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-gray-500" />
							<span className="font-medium">Last Updated:</span>
							<span>{new Date(user.updatedAt).toLocaleString()}</span>
						</div>
					</CardContent>
				</Card>

				{/* Actions Card */}
				<Card>
					<CardHeader>
						<CardTitle>Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							className="w-full"
							onClick={() =>
								navigate({
									to: "/admin/users/$userId/update",
									params: { userId: user.id },
								})
							}
						>
							Edit User
						</Button>
						{/* Add more actions as needed */}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
