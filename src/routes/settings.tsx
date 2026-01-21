import {
  Link,
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import { Bell, Camera, ChevronsLeft, Lock, LogOut, User } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  loader: async () => { },
  component: RouteComponent,
});

function RouteComponent() {
  const [profileData, setProfileData] = React.useState({
    name: "Alex Thompson",
    email: "alex@example.com",
    bio: "Adventure seeker & nature lover.",
    location: "Portland, Oregon",
  });

  const [notifications, setNotifications] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    newFollowers: true,
    placeRecommendations: true,
  });

  const [privacy, setPrivacy] = React.useState({
    profilePublic: true,
    showLocation: true,
    showVisitedPlaces: true,
  });

  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSavePrivacy = () => {
    toast.success("Privacy settings updated!");
  };

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
        <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
          Settings
        </h1>
        <p className="mb-8 text-muted-foreground">
          Manage your account preferences
        </p>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
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
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" />
                  <AvatarFallback>AT</AvatarFallback>
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

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Bell className="h-5 w-5 text-accent" />
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
                  <p className="font-medium text-foreground">
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
                  <p className="font-medium text-foreground">
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
                  <p className="font-medium text-foreground">Weekly Digest</p>
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
                  <p className="font-medium text-foreground">New Followers</p>
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
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lock className="h-5 w-5 text-primary" />
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
                  <p className="font-medium text-foreground">Public Profile</p>
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
                  <p className="font-medium text-foreground">Show Location</p>
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
                  <p className="font-medium text-foreground">
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
                  <p className="font-medium text-foreground">
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
                  <p className="font-medium text-foreground">Delete Account</p>
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
  );
}
