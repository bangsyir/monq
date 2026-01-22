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
            className="border-border bg-secondary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
          >
            <Compass className="text-primary h-5 w-5" />
            <span className="text-foreground text-sm font-medium">
              Discover Nature's Best Kept Secrets
            </span>
          </motion.div>

          <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Find Your Next
            <span className="text-primary block">Hidden Adventure</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
            Explore breathtaking waterfalls, serene campsites, challenging
            trails, and secret spots.
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-xl"
          >
            <div className="border-border bg-card rounded-2xl border p-2 shadow-lg">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
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
                      "w-full gap-2 rounded-xl px-4 py-5 sm:w-auto",
                    )}
                  >
                    <Search className="h-5 w-5" />
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { value: "500+", label: "Hidden Gems" },
              { value: "50K+", label: "Explorers" },
              { value: "4.9", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-foreground text-3xl font-bold md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
