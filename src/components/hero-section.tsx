import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Compass, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const HeroSection = () => {
  return (
    <section className="relative min-h-[30vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6 border border-border"
          >
            <Compass className="w-5 h-5 text-primary" />
            <span className="text-foreground text-sm font-medium">
              Discover Nature's Best Kept Secrets
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Find Your Next
            <span className="block text-primary">Hidden Adventure</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore breathtaking waterfalls, serene campsites, challenging
            trails, and secret spots.
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-card rounded-2xl p-2 shadow-lg border border-border">
              <div className="flex flex-col items-center sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Where do you want to explore?"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <Link to="/places" search={{ cat: "all" }}>
                  <Button
                    className={cn(
                      "w-full sm:w-auto gap-2 px-4 py-5 rounded-xl",
                    )}
                  >
                    <Search className="w-5 h-5" />
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
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12"
          >
            {[
              { value: "500+", label: "Hidden Gems" },
              { value: "50K+", label: "Explorers" },
              { value: "4.9", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
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
