import { createFileRoute } from "@tanstack/react-router"
import FeaturedPlaces from "@/components/featured-places"
import HeroSection from "@/components/hero-section"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/")({
  component: App,
  loader: ({ context }) => {
    const user = context?.user
    return { user: { username: user?.username, role: user?.role } }
  },
})

function App() {
  const { user } = Route.useLoaderData()
  return (
    <div className="min-h-screen">
      <Navbar username={user?.username} role={user.role!} />
      <HeroSection />
      <FeaturedPlaces />
    </div>
  )
}
