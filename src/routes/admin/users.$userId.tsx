import { createServerFn } from "@tanstack/react-start"
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronsLeft,
  Mail,
  Pencil,
  Shield,
  User,
  XCircle,
} from "lucide-react"
import { eq } from "drizzle-orm"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { db } from "@/db"
import { users } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const getUserFn = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    return user[0] || null
  })

export const Route = createFileRoute("/admin/users/$userId")({
  loader: async ({ params }) => {
    const user = await getUserFn({ data: { userId: params.userId } })
    return { user }
  },
  component: RouteComponent,
  notFoundComponent: () => <div>User not found</div>,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()

  if (!user) {
    return <div>User not found</div>
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "moderator":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link to="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ChevronsLeft className="h-5 w-5" />
            Back to Users
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-semibold tracking-tight text-balance">
              User Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View complete information for this user
            </p>
          </div>
          <Link to="/admin/users/$userId/update" params={{ userId: user.id }}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="border-border h-16 w-16 border-2">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {user.username!.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-foreground text-2xl">
                  {user.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  @{user.username}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={getRoleBadgeVariant(user.role!)}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-border text-foreground"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    Email Address
                  </p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-green-500">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="text-muted-foreground text-xs">
                          Not verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex items-start gap-3">
                <User className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    Username
                  </p>
                  <p className="text-muted-foreground text-sm">
                    @{user.username}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    Created At
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex items-start gap-3">
                <Shield className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Role</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex items-start gap-3">
                <Ban className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    Account Status
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {user.banned ? "Account is banned" : "Account is active"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">User ID</CardTitle>
            <CardDescription className="text-muted-foreground">
              Unique identifier for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg px-4 py-3">
              <code className="text-foreground text-sm">{user.id}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
