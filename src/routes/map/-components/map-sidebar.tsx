import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar"

export function MapSidebarContent({
  searchQuery,
  setSearchQuery,
  filteredPlaces,
  isLoading,
  onPlaceClick,
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filteredPlaces: Array<any>
  isLoading: boolean
  onPlaceClick: (place: any) => void
}) {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-3">
                  <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
                  <div className="bg-muted h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No places found" : "No places in this area"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map((place: any) => (
                <div
                  key={place.id}
                  className="hover:bg-accent cursor-pointer rounded-lg border p-3 transition-colors"
                  onClick={() => onPlaceClick(place)}
                >
                  <h3 className="font-medium">{place.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {place.streetAddress}, {place.city}
                  </p>
                  {place.rating && (
                    <p className="text-sm text-yellow-500">
                      {"★".repeat(Math.round(place.rating))}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
    </>
  )
}
