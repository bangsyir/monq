import { createServerFn } from "@tanstack/react-start"
import {
  addRatingSchema,
  getUserRatingSchema,
  updateRatingSchema,
} from "./rating-schema"
import {
  addRatingService,
  getUserRatingService,
  updateRatingService,
} from "./rating-service.server"
import { authMiddleware, optionalAuthMiddleware } from "@/lib/auth-middleware"

export const addRating = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addRatingSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await addRatingService({
      placeId: data.placeId,
      userId,
      rating: data.rating,
    })
    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const updateRating = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateRatingSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await updateRatingService(data.placeId, userId, data.rating)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getUserRating = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getUserRatingSchema)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id

    if (!userId) {
      return null
    }

    const result = await getUserRatingService(data.placeId, userId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })
