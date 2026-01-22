import { Moon, Sun, SunMoon } from "lucide-react"
import React from "react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Read the theme from the DOM after hydration
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing a neutral state until mounted
  if (!mounted) {
    return (
      <Button
        variant={"outline"}
        size={"icon"}
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        <SunMoon className="h-5 w-5" />
      </Button>
    )
  }

  const isDarkTheme = theme === "dark"
  return (
    <div className="relative">
      <Button
        variant={"outline"}
        size={"icon"}
        name="theme"
        aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
        onClick={toggleTheme}
      >
        {isDarkTheme ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
