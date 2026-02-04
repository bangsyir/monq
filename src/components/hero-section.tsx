import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Compass, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HeroSection = () => {
  return (
    <section className="from-primary/10 via-background to-accent/10 relative flex min-h-[30vh] items-center justify-center bg-gradient-to-br">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border-border bg-success/60 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
          >
            <Compass className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">
              Discover Nature's Best Kept Secrets
            </span>
          </motion.div>

          <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Find Your Next
            <span className="text-primary block">Hidden Adventure</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
            Explore breathtaking waterfalls, serene campsites, challenging
            trails, and secret places.
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-xl"
          >
            <div className="border-border bg-card rounded-2xl border p-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="bg-secondary flex flex-1 items-center gap-3 rounded-xl px-4 py-3">
                  <MapPin className="text-muted-foreground h-5 w-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Where do you want to explore?"
                    className="text-foreground placeholder:text-muted-foreground w-full bg-transparent focus:outline-none"
                  />
                </div>
                <Link to="/places" search={{ cat: "all" }}>
                  <Button
                    className={cn(
                      "bg-success w-full gap-2 rounded-xl px-4 py-5 text-white sm:w-auto",
                    )}
                  >
                    <Search className="h-5 w-5" />
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
