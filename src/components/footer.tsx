import { Link } from "@tanstack/react-router"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              monq.
            </Link>
            <p className="text-muted-foreground text-sm">
              Discover nature's best kept secrets
            </p>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} monq. All rights reserved.
          </p>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" />{" "}
            for nature lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
