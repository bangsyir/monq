import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { authMiddleware } from "@/lib/auth-middleware"
import {
  addPlaceServerSchema,
  updatePlaceServerSchema,
} from "@/schema/place-schema"
import {
  createPlace,
  getPlace,
  updatePlaceService,
} from "@/services/places-service.server"

export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addPlaceServerSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const insert = await createPlace(data, userId)
    if (insert.error) {
      throw new Error(insert.error.message)
    }
    return insert
  })

export const getPlaceById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data: placeId }) => {
    const result = await getPlace(placeId)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result.data
  })

export const updatePlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updatePlaceServerSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await updatePlaceService(data, userId)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result
  })
