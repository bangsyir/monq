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
  streetAddress: string
  city: string
  stateProvince: string
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
  avgRating: number
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
  description: string | null
  categories: Array<string>
  location: PlaceLocation
  images: Array<PlaceImage>
  rating: number | null
  amenities: Array<PlaceAmenity>
  difficulty?: string | null
  duration?: number | null
  distance?: number | null
  elevation?: number | null
  bestSeason?: Array<string> | null
  isFeatured?: boolean
  createdAt: string
}
