import { z } from "zod"

export const addRatingSchema = z.object({
  placeId: z.string(),
  rating: z.number().int().min(1).max(5),
})

export const updateRatingSchema = z.object({
  placeId: z.string(),
  rating: z.number().int().min(1).max(5),
})

export const getUserRatingSchema = z.object({
  placeId: z.string(),
})

export type AddRatingInput = z.infer<typeof addRatingSchema>
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>
export type GetUserRatingInput = z.infer<typeof getUserRatingSchema>
