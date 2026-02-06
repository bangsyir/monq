export interface Category {
  id: string
  name: string
  icon: string
  image: string | null
}

export interface UpdateCategoryInput {
  id: string
  name?: string
  icon?: string
  image?: string | null
}
