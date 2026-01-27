import {
  Link,
  createFileRoute,
  redirect,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { Camera, ChevronsLeft, LogOut, User } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "@tanstack/react-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { updateUserProfile } from "@/serverFunction/user.function"
import { updateUserSchema } from "@/schema/user-schema"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      toast.error("Opss please login first")
      throw redirect({ to: "/" })
    }
    const user = context.user
    return {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    }
  },
})

function RouteComponent() {
  const { user: userData } = Route.useLoaderData()

  const navigate = useNavigate()
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully")
          navigate({ to: "/" })
        },
      },
    })
  }

  const form = useForm({
    defaultValues: {
      name: userData?.name || "",
      username: userData?.username || "",
      email: userData?.email || "",
    },
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUserProfile({
          data: value,
        })
        toast.success("Profile updated successfully!", {
          className: "bg-green-500 text-primary",
        })
      } catch (error) {
        toast.error("Failed to update profile", {
          className: "bg-red-500 text-primary",
        })
      }
    },
  })

  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleSaveProfile = () => {
    form.handleSubmit()
  }

  return (
    <main className="pt-10 pb-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="pb-4">
          {canGoBack ? (
            <Button variant="outline" onClick={() => router.history.back()}>
              <ChevronsLeft className="h-5 w-5" />
              Go back
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                variant: "outline",
              })}
              to="/"
            >
              <ChevronsLeft className="h-5 w-5" />
              Go back
            </Link>
          )}
        </div>
        <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your account preferences
        </p>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <User className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData?.image || ""} />
                  <AvatarFallback>
                    {userData?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Full Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="username">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Username</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        disabled
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSaveProfile}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </form.Subscribe>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Log out of all devices
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Sign out from all sessions
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out All
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Delete Account</p>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
