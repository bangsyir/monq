import {
  Link,
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router"
import { Bell, Camera, ChevronsLeft, Lock, LogOut, User } from "lucide-react"
import React from "react"
import { toast } from "sonner"
import { useQuery, useMutation } from "@tanstack/react-query"
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
import { Switch } from "@/components/ui/switch"

import { getUserProfile, updateUserProfile } from "@/lib/user-profile-server-fn"

export const Route = createFileRoute("/settings")({
  loader: () => getUserProfile(),
  component: RouteComponent,
})

function RouteComponent() {
  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    initialData: null,
  })

  const [profileData, setProfileData] = React.useState({
    name: "",
    email: "",
  })

  React.useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
      })
    }
  }, [userData])

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })

  const [notifications, setNotifications] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    newFollowers: true,
    placeRecommendations: true,
  })

  const [privacy, setPrivacy] = React.useState({
    profilePublic: true,
    showLocation: true,
    showVisitedPlaces: true,
  })

  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: profileData.name,
      email: profileData.email,
    } as any)
  }

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!")
  }

  const handleSavePrivacy = () => {
    toast.success("Privacy settings updated!")
  }

  return (
    <main className="pt-10 pb-20">
      <div className="container mx-auto max-w-4xl px-4">
        {canGoBack ? (
          <Button variant="outline" onClick={() => router.history.back()}>
            <ChevronsLeft className="h-5 w-5" />
            Back
          </Button>
        ) : (
          <Link
            className={buttonVariants({
              variant: "outline",
            })}
            to="/"
          >
            <ChevronsLeft className="h-5 w-5" />
            Back
          </Link>
        )}
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
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 rounded-lg p-2">
                  <Bell className="text-accent h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Choose what you want to be notified about
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Email Notifications
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Push Notifications
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      pushNotifications: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Weekly Digest</p>
                  <p className="text-muted-foreground text-sm">
                    Get a weekly summary of new places
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      weeklyDigest: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">New Followers</p>
                  <p className="text-muted-foreground text-sm">
                    When someone follows you
                  </p>
                </div>
                <Switch
                  checked={notifications.newFollowers}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      newFollowers: checked,
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} className="mt-4">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Lock className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>
                    Control your privacy settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Public Profile</p>
                  <p className="text-muted-foreground text-sm">
                    Allow others to see your profile
                  </p>
                </div>
                <Switch
                  checked={privacy.profilePublic}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, profilePublic: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Show Location</p>
                  <p className="text-muted-foreground text-sm">
                    Display your location on your profile
                  </p>
                </div>
                <Switch
                  checked={privacy.showLocation}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, showLocation: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Show Visited Places
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Let others see places you've visited
                  </p>
                </div>
                <Switch
                  checked={privacy.showVisitedPlaces}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, showVisitedPlaces: checked })
                  }
                />
              </div>

              <Button onClick={handleSavePrivacy} className="mt-4">
                Save Privacy Settings
              </Button>
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
                <Button variant="outline" className="gap-2">
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
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
