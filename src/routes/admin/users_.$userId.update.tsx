import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { createServerFn, useServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { ArrowLeft, Save } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { users } from "@/db/schema"

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
  notFoundComponent: () => <div>User not found</div>,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  const navigate = useNavigate({ from: "/admin/users" })
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
    setErrors({})

    try {
      const result = await updateUserMutation({
        data: {
          ...formData,
          userId: user.id,
        },
      })

      if (result) {
        navigate({ to: "/admin/users", search: true })
      } else {
        setErrors({ general: "Failed to update user" })
      }
    } catch (error) {
      setErrors({ general: "An error occurred while updating user" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <h1 className="text-2xl font-bold">Update User</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailVerified">Email Verified</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailVerified"
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) =>
                      handleInputChange("emailVerified", checked)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="emailVerified" className="text-sm">
                    {formData.emailVerified ? "Verified" : "Not Verified"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="banned"
                  checked={formData.banned}
                  onCheckedChange={(checked) =>
                    handleInputChange("banned", checked)
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="banned" className="text-sm">
                  {formData.banned ? "User is banned" : "User is active"}
                </Label>
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
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
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
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
