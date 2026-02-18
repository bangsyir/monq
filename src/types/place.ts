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

export interface PlaceComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  comment: string
  createdAt: string
  updatedAt?: string
  replies?: Array<PlaceComment>
  replyCount?: number
  isEditable?: boolean
}

export interface Place {
  id: string
  name: string
  description: string
  categories: Array<PlaceCategory>
  location: PlaceLocation
  images: Array<PlaceImage>
  rating: number
  reviewCount: number
  amenities: Array<PlaceAmenity>
  difficulty?: "easy" | "moderate" | "hard" | "expert"
  duration?: string
  distance?: string
  elevation?: string
  bestSeason?: Array<string>
  isFeatured?: boolean
  createdAt: string
}
