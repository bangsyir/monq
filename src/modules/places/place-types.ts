export interface PlaceImage {
  id: string
  url: string
  alt: string
}

export interface PlaceLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
}

export interface PlaceAmenity {
  id: string
  name: string
  icon: string
}

export interface FeaturedPlace {
  id: string
  name: string
  description: string | null
  location: PlaceLocation
  categories: Array<string>
  images: Array<PlaceImage>
  rating: number | null
  reviewCount: number | null
  amenities: Array<PlaceAmenity>
  difficulty: string | null
  duration: number | null
  distance: number | null
  elevation: number | null
  bestSeason: string | null
  isFeatured: boolean
  createdAt: string
}

// Raw database row type for getPlacesWithDetailsRepo
export interface PlaceWithDetailsRaw {
  id: string
  name: string
  description: string | null
  latitude: number | null
  longitude: number | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  country: string | null
  rating: number | null
  reviewCount: number | null
  difficulty: string | null
  duration: number | null
  distance: number | null
  elevation: number | null
  bestSeason: Array<string> | null
  amenities: Array<string> | null
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  categories: Array<string>
  first_image: PlaceImage | null
}

// Transformed return type for getPlacesWithDetailsRepo (same structure as FeaturedPlace)
export type PlaceWithDetails = FeaturedPlace
