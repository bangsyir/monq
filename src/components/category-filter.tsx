import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  Compass,
  Droplets,
  Footprints,
  Mountain,
  Snowflake,
  Tent,
  Waves,
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Compass className="h-6 w-6" />,
  waterfall: <Droplets className="h-6 w-6" />,
  campsite: <Tent className="h-6 w-6" />,
  hiking: <Mountain className="h-6 w-6" />,
  trail: <Footprints className="h-6 w-6" />,
  lake: <Waves className="h-6 w-6" />,
  mountain: <Snowflake className="h-6 w-6" />,
}

const categories = [
  { id: "all", name: "All" },
  { id: "waterfall", name: "Waterfalls" },
  { id: "campsite", name: "Campsites" },
  { id: "hiking", name: "Hiking" },
  { id: "trail", name: "Trails" },
  { id: "lake", name: "Lakes" },
  { id: "mountain", name: "Mountains" },
]

const CategoryFilter = ({
  selectedCategory,
}: {
  selectedCategory: string | "all"
}) => {
  return (
    <div className="scrollbar-hide w-full overflow-x-auto py-4">
      <div className="flex min-w-max justify-center gap-8 px-2 md:px-0">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          return (
            <Link to="/places" search={{ cat: category.id }} key={category.id}>
              <motion.button
                className={`flex flex-col items-center gap-2 border-b-2 px-1 pb-3 transition-all duration-200 ${
                  isSelected
                    ? "border-foreground text-foreground"
                    : "text-muted-foreground hover:border-border hover:text-foreground border-transparent"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-60"}`}
                >
                  {categoryIcons[category.id]}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </motion.button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFilter
