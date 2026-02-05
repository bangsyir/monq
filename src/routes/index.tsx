import { Link, createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Category } from "@/services/category.service"
import FeaturedPlaces from "@/components/featured-places"
import HeroSection from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { getCategories } from "@/serverFunction/category.function"

export const Route = createFileRoute("/")({
  component: App,
  loader: ({ context }) => {
    const user = context?.user
    return { user: { username: user?.username, role: user?.role } }
  },
})

function CategoriesSection() {
  const getCategoriesFn = useServerFn(getCategories)

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesFn(),
  })

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex-cols flex gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-muted aspect-[4/3] animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <span className="text-primary text-sm font-medium tracking-wide uppercase">
                Browse by Category
              </span>
            </div>
            <h2 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
              Explore by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Find your perfect adventure from our curated categories
            </p>
          </div>
        </motion.div>

        <div className="flex-cols flex w-full gap-4 overflow-x-auto">
          {categories?.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  index,
}: {
  category: Category
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to="/places"
        search={{ cat: category.name.toLowerCase() }}
        className="group relative block overflow-hidden rounded-xl"
      >
        <div className="aspect-[4/3] w-40 lg:w-64">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="from-primary/20 to-accent/20 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <span className="text-4xl">{category.icon}</span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="mb-1 text-xl font-semibold text-white">
            {category.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-white/80 transition-colors group-hover:text-white">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div className="absolute top-3 right-3 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors group-hover:bg-white/30">
          <span className="text-lg">{category.icon}</span>
        </div>
      </Link>
    </motion.div>
  )
}

function App() {
  const { user } = Route.useLoaderData()
  return (
    <div className="min-h-screen">
      <Navbar username={user?.username} role={user.role!} />
      <HeroSection />
      <CategoriesSection />
      <FeaturedPlaces />
    </div>
  )
}
