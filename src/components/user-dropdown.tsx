import { Link } from "@tanstack/react-router"
import { LogOut, Settings, ShieldUser, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthUserDropdown({
  name,
  role,
  handleLogout,
}: {
  name: string | undefined
  role: string
  handleLogout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={`flex items-center gap-2 rounded-full`}
          />
        }
      >
        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
          <User className="text-muted-foreground h-5 w-5" />
        </div>
        {name}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          {role === "admin" && (
            <DropdownMenuItem render={<Link to="/admin" />}>
              <ShieldUser />
              Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link to="/settings" />}>
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
