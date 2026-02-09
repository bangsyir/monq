import { Link, useNavigate } from "@tanstack/react-router"
import { Loader } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import LoginDialog from "./login-dialog"
import { ThemeToggle } from "./theme-toggle"
import { AuthUserDropdown } from "./user-dropdown"
import { authClient } from "@/lib/auth-client"

export function Navbar({
  username,
  role,
}: {
  username: string | undefined
  role: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully")
          queryClient.removeQueries({ queryKey: ["get-user-session"] })
          navigate({ to: "/" })
        },
      },
    })
  }
  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b pt-2 pb-2 backdrop-blur">
      <div className="relative container mx-auto flex items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Loader className="size-4" />
          </div>
          monq.
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {username ? (
            <AuthUserDropdown
              name={username}
              role={role}
              handleLogout={handleLogout}
            />
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </nav>
  )
}
