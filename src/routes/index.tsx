import FeaturedPlaces from "@/components/featured-places"
import HeroSection from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedPlaces />
    </div>
  )
}
