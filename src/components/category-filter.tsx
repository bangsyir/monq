import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  Compass,
  Droplets,
  Tent,
  Mountain,
  Footprints,
  Waves,
  Snowflake,
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Compass className="w-6 h-6" />,
  waterfall: <Droplets className="w-6 h-6" />,
  campsite: <Tent className="w-6 h-6" />,
  hiking: <Mountain className="w-6 h-6" />,
  trail: <Footprints className="w-6 h-6" />,
  lake: <Waves className="w-6 h-6" />,
  mountain: <Snowflake className="w-6 h-6" />,
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
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-8 min-w-max px-2 md:px-0 justify-center">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          return (
            <Link to="/places" search={{ cat: category.id }} key={category.id}>
              <motion.button
                className={`flex flex-col items-center gap-2 pb-3 px-1 border-b-2 transition-all duration-200 ${
                  isSelected
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
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
