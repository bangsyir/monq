import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { ChevronsLeft, Save } from "lucide-react"
import { createServerFn, useServerFn } from "@tanstack/react-start"
import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { users } from "@/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/db"

const UpdateUserSchema = z.object({
  userId: z.string().min(1, "user id required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  role: z.enum(["user", "admin"]).default("user"),
  emailVerified: z.boolean().default(false),
  banned: z.boolean().default(false),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
})

const getUserFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { userId: string } }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    return user[0] || null
  })

const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateUserSchema)
  .handler(async ({ data }) => {
    const { banExpires, ...updateData } = data

    const updateValues = {
      ...updateData,
      updatedAt: new Date(),
      banExpires: banExpires ? new Date(banExpires) : null,
    }

    const result = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, data.userId))
      .returning()

    return result[0] || null
  })

export const Route = createFileRoute("/admin/users_/$userId/update")({
  loader: async ({ params }) => {
    const user = await getUserFn({ data: { userId: params.userId } })
    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  const navigate = useNavigate({ from: "/admin/users/" })
  const updateUserMutation = useServerFn(updateUserFn)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: (user?.role as "user" | "admin") || "user",
    emailVerified: user?.emailVerified || false,
    banned: user?.banned || false,
    banReason: user?.banReason || "",
    banExpires: user?.banExpires
      ? new Date(user.banExpires).toISOString().split("T")[0]
      : "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user) {
    return <div>User not found</div>
  }

  const handleBack = () => {
    navigate({ to: "/admin/users", search: true })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateUserMutation({
        data: {
          ...formData,
          userId: user.id,
        },
      })

      if (result) {
        navigate({ to: "/admin/users", search: true })
        toast.success("Succes update user")
      } else {
        toast.error("Failed to update user")
      }
    } catch (error) {
      toast.error("An error occurred while updating user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronsLeft className="h-5 w-5" />
          Back to Users
        </Button>

        <h1 className="text-2xl font-bold">Update User</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 lg:w-1/2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="border-border h-16 w-16 border-2">
                <AvatarImage src={user.image!} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {user.username ? user?.username.slice(0, 2) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-foreground">User Profile</CardTitle>
                <CardDescription className="text-muted-foreground">
                  ID: {user.id}
                </CardDescription>
              </div>{" "}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="text-sm text-red-600">{errors.general}</div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="text-sm text-red-600">{errors.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="text-sm text-red-600">{errors.email}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <div className="text-sm text-red-600">{errors.role}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Account Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage verification status and access control
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <Label
                  htmlFor="emailVerified"
                  className="text-foreground font-medium"
                >
                  Email Verified
                </Label>
                <p className="text-muted-foreground text-sm">
                  Mark this user&apos;s email as verified
                </p>
              </div>
              <Switch
                id="emailVerified"
                checked={formData.emailVerified}
                onCheckedChange={(checked) =>
                  handleInputChange("emailVerified", checked)
                }
              />
            </div>

            <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="banned" className="text-foreground font-medium">
                  Ban User
                </Label>
                <p className="text-muted-foreground text-sm">
                  Restrict this user from accessing the platform
                </p>
              </div>
              <Switch
                id="banned"
                checked={formData.banned}
                onCheckedChange={(checked) =>
                  handleInputChange("banned", checked)
                }
              />
            </div>
            {formData.banned && (
              <div className="space-y-4 border-l-2 border-gray-200 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="banReason">Ban Reason</Label>
                  <Textarea
                    id="banReason"
                    value={formData.banReason}
                    onChange={(e) =>
                      handleInputChange("banReason", e.target.value)
                    }
                    placeholder="Reason for banning this user..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banExpires">Ban Expires (optional)</Label>
                  <Input
                    id="banExpires"
                    type="date"
                    value={formData.banExpires}
                    onChange={(e) =>
                      handleInputChange("banExpires", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Metadata</CardTitle>
            <CardDescription className="text-muted-foreground">
              Read-only information about this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground text-sm font-medium">
                Created At
              </span>
              <span className="text-muted-foreground text-sm">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground text-sm font-medium">
                User ID
              </span>
              <code className="text-muted-foreground text-sm">{user.id}</code>
            </div>
          </CardContent>
        </Card>
        <div>
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-foreground flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
