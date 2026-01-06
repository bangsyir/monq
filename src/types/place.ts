export type PlaceCategory =
  | "waterfall"
  | "campsite"
  | "hiking"
  | "trail"
  | "lake"
  | "mountain"

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

export interface PlaceImage {
  id: string
  url: string
  alt: string
}

export interface PlaceReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface Place {
  id: string
  name: string
  description: string
  category: PlaceCategory
  location: PlaceLocation
  images: PlaceImage[]
  rating: number
  reviewCount: number
  amenities: PlaceAmenity[]
  difficulty?: "easy" | "moderate" | "hard" | "expert"
  duration?: string
  distance?: string
  elevation?: string
  bestSeason?: string[]
  isFeatured?: boolean
  createdAt: string
}
