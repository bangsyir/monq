import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { count } from "drizzle-orm"
import {
  createPlaceService,
  getFeaturedPlacesService,
  getPlaceService,
  getPlacesByBoundsService,
  getPlacesForIndexService,
  getPlacesService,
  getTotalPlacesService,
  updatePlaceImagesService,
  updatePlaceService,
} from "@/modules/places/place-service.server"
import {
  MainPlaceFilterSchema,
  PlaceQuerySchema,
  addPlaceServerSchema,
  updatePlaceServerSchema,
} from "@/modules/places/place-schema"
import { placeConditionFilterRepo } from "@/modules/places/place-repo.server"
import { authMiddleware, rateLimitMiddleware } from "@/lib/auth-middleware"
import { createDb } from "@/db"
import { places } from "@/db/schema"

export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addPlaceServerSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const insert = await createPlaceService(data, userId)
    if (insert.error) {
      throw new Error(insert.error.message)
    }
    return insert
  })

export const getPlaceById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data: placeId }) => {
    const result = await getPlaceService(placeId)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result.data
  })

export const getPlaceByIdNoAuth = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data: placeId }) => {
    const result = await getPlaceService(placeId)
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
    const db = createDb()
    const result = await db.select({ count: count() }).from(places)
    return result[0].count || 0
  },
)

export const getPlaces = createServerFn({ method: "GET" })
  .middleware([rateLimitMiddleware])
  .inputValidator(PlaceQuerySchema)
  .handler(async ({ data }) => {
    const { search, page, sortBy, sortOrder } = data
    const currentPage = page || 1
    const limit = 25
    const offset = (currentPage - 1) * limit
    // Build where conditions
    const whereConditions = placeConditionFilterRepo(search)
    const totalPlaces = await getTotalPlacesService({ filter: whereConditions })
    if (totalPlaces.error) {
      throw new Error(totalPlaces.message, { cause: totalPlaces.error })
    }
    const result = await getPlacesService({
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

export const getPlacesForIndex = createServerFn({ method: "GET" })
  .middleware([rateLimitMiddleware])
  .inputValidator(MainPlaceFilterSchema)
  .handler(async ({ data }) => {
    const currentPage = data.page || 1
    const limit = 12

    const result = await getPlacesForIndexService(
      data.category,
      data.search,
      currentPage,
      limit,
    )
    if (result.error) {
      throw new Error(result.error.message)
    }
    return {
      places: result.places,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPage: result.totalPage,
      hasLeft: result.hasLeft,
      hasMore: result.hasMore,
    }
  })

export const getFeaturedPlaces = createServerFn({ method: "GET" })
  .inputValidator(z.number().optional())
  .handler(async ({ data }) => {
    const limit = data || 8
    const result = await getFeaturedPlacesService(limit)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result.data
  })

const MapBoundsSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
})

export const getPlacesByBounds = createServerFn({ method: "GET" })
  .inputValidator(MapBoundsSchema)
  .handler(async ({ data }) => {
    const result = await getPlacesByBoundsService(data)
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result.data
  })
