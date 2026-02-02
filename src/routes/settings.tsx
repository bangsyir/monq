import {
  Link,
  createFileRoute,
  redirect,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { Camera, ChevronsLeft, LogOut, User } from "lucide-react"
import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { updateUserProfile } from "@/serverFunction/user.function"
import { updateUserSchema } from "@/schema/user-schema"
import { authClient } from "@/lib/auth-client"
import { getAvatarOptions } from "@/serverFunction/gallery.function"
import { FieldError } from "@/components/ui/field"

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (!context.user) {
      toast.error("Opss please login first")
      throw redirect({ to: "/" })
    }
    const user = context.user
    const avatarOptions = await getAvatarOptions()
    return {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
      },
      avatarOptions,
    }
  },
  ssr: false,
})

function RouteComponent() {
  const { user: userData, avatarOptions } = Route.useLoaderData()
  const [selectedImage, setSelectedImage] = useState(userData?.image || "")
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

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

  const handleSelectAvatar = (path: string) => {
    setSelectedImage(path)
    setIsAvatarDialogOpen(false)
    toast.success("Avatar selected. Click Save Changes to update.")
  }
  // profile form update
  const form = useForm({
    defaultValues: {
      name: userData?.name || "",
      username: userData?.username || "",
      email: userData?.email || "",
      image: selectedImage || userData.image || "",
    },
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = {
          ...value,
          image: selectedImage,
        }
        await updateUserProfile({
          data,
        })
        toast.success("Profile updated successfully!")
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
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
            <Button variant="ghost" onClick={() => router.history.back()}>
              <ChevronsLeft className="h-5 w-5" />
              Go back
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                variant: "ghost",
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
                  <AvatarImage src={selectedImage || userData?.image || ""} />
                  <AvatarFallback>
                    {userData?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="name">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Full Name</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </div>
                    )
                  }}
                </form.Field>
                <form.Field name="username">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Username</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </div>
                    )
                  }}
                </form.Field>
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
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
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </div>
                    )
                  }}
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
                    className="w-48"
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

      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose an Avatar</DialogTitle>
            <DialogDescription>
              Select a new avatar for your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-4 gap-3 overflow-y-auto p-2">
            {avatarOptions && avatarOptions.length > 0 ? (
              avatarOptions.map((avatar: { name: string; path: string }) => (
                <button
                  key={avatar.path}
                  onClick={() => handleSelectAvatar(avatar.path)}
                  className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedImage === avatar.path
                      ? "border-primary ring-primary/20 ring-2"
                      : "hover:border-muted border-transparent"
                  }`}
                >
                  <img
                    src={avatar.path}
                    alt={avatar.name}
                    className="h-full w-full object-cover"
                  />
                  {selectedImage === avatar.path && (
                    <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary rounded-full p-1 text-white">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-center text-xs text-white">
                      {avatar.name}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground col-span-4 py-8 text-center">
                No avatars available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
