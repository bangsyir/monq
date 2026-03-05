export interface Rating {
  id: string
  placeId: string
  userId: string
  rating: number
  createdAt: Date
}

export interface RatingWithUser extends Rating {
  user: {
    id: string
    name: string
    image: string | null
  }
}

export interface UserRating {
  id: string
  placeId: string
  userId: string
  rating: number
  createdAt: Date
}

export interface AddRatingData {
  placeId: string
  userId: string
  rating: number
}
