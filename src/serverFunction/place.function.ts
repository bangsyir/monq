import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { count, ilike, or } from "drizzle-orm"
import { authMiddleware } from "@/lib/auth-middleware"
import {
  PlaceQuerySchema,
  addPlaceServerSchema,
  updatePlaceServerSchema,
} from "@/schema/place-schema"
import {
  createPlace,
  getPlace,
  getPlaces,
  getTotalPlaces,
  updatePlaceImagesService,
  updatePlaceService,
} from "@/services/places-service.server"
import { db } from "@/db"
import { places } from "@/db/schema"

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

// Separate server function for updating place images only
export const updatePlaceImages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      placeId: z.string(),
      images: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    const result = await updatePlaceImagesService(data.placeId, data.images)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result
  })

// Function to get total places count
export const getTotalPlacesCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db.select({ count: count() }).from(places)
    return result[0].count || 0
  },
)

export const getPlacesFn = createServerFn({ method: "GET" })
  .inputValidator(PlaceQuerySchema)
  .handler(async ({ data }) => {
    const { search, page, sortBy, sortOrder } = data
    const currentPage = page || 1
    const limit = 100
    const offset = (currentPage - 1) * limit
    // Build where conditions
    const whereConditions = search
      ? or(
          ilike(places.name, `%${search}%`),
          ilike(places.description, `%${search}%`),
          ilike(places.city, `%${search}%`),
          ilike(places.stateProvince, `%${search}%`),
          ilike(places.country, `%${search}%`),
        )
      : undefined
    const totalPlaces = await getTotalPlaces({ filter: whereConditions })
    if (totalPlaces.error) {
      throw new Error(totalPlaces.message, { cause: totalPlaces.error })
    }
    const result = await getPlaces({
      filter: whereConditions,
      limit,
      offset,
      sortBy,
      sortOrder,
    })
    if (result.error) {
      throw new Error(result.error.message, { cause: result.error.cause })
    }
    const totalPage = Math.ceil(Number(totalPlaces.data?.count) / limit)
    return {
      places: result.data,
      totalCount: totalPlaces.data?.count,
      currentPage: currentPage,
      totalPage: totalPage,
      hasLeft: currentPage > 1,
      hasMore: currentPage < totalPage,
    }
  })
