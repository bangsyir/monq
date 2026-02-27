import {
  deletePlaceCategoriesRepo,
  deletePlaceImagesRepo,
  getFeaturedPlacesRepo,
  getPlaceByIdRepo,
  getPlacesByBoundsRepo,
  getPlacesCountWithFiltersRepo,
  getPlacesRepo,
  getPlacesWithDetailsRepo,
  getTotalPlaceRepo,
  insertCategoriesRepo,
  insertImageRepo,
  insertPlaceRepo,
  updatePlaceRepo,
} from "./place-repo.server"
import type { SQL } from "drizzle-orm"
import type { AddPlaceServer, UpdatePlaceServer } from "@/modules/places"
import { safeDbQuery } from "@/utils/safe-db-query"
import { createDb } from "@/db"
import { categories } from "@/db/schema"

// Helper function to get category IDs by names
async function getCategoryIdsByName(
  categoryNames: Array<string>,
): Promise<Array<string>> {
  const db = createDb()
  const allCategories = await db.select().from(categories)
  return categoryNames
    .map((name) => {
      const category = allCategories.find(
        (cat) =>
          cat.name.toLowerCase() === name.toLowerCase() || cat.name === name,
      )
      return category?.id
    })
    .filter((id): id is string => id !== undefined)
}

export async function createPlaceService(data: AddPlaceServer, userId: string) {
  const dataMap = {
    name: data.name,
    description: data.description,
    streetAddress: data.streetAddress,
    postcode: data.postcode,
    city: data.city,
    stateProvince: data.stateProvince,
    country: data.country,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    difficulty: data.difficulty,
    duration: data.duration,
    distance: data.distance,
    rating: 0,
    amenities: data.amenities,
    isFeatured: data.isFeatured,
    bestSeason: data.bestSeason,
  }
  const [addPlace, addPlaceError] = await safeDbQuery(
    insertPlaceRepo(dataMap, userId),
  )
  if (addPlaceError) {
    return addPlaceError
  }
  const categoryIds = await getCategoryIdsByName(data.categories)
  const placeCategoryRelations = categoryIds.map((categoryId: string) => {
    return { placeId: addPlace[0].id, categoryId }
  })
  const [_, addCategoriesErr] = await safeDbQuery(
    insertCategoriesRepo(placeCategoryRelations),
  )
  if (addCategoriesErr) {
    return addCategoriesErr
  }
  if (data.images?.length !== 0) {
    const images =
      data.images?.map((c: string) => {
        return { placeId: addPlace[0].id, url: c, alt: addPlace[0].title }
      }) || []
    const [__, addImagesErr] = await safeDbQuery(insertImageRepo(images))
    if (addImagesErr) {
      return addImagesErr
    }
  }

  return { message: "Successful update place", error: null }
}

export async function getPlaceService(placeId: string) {
  const [place, error] = await safeDbQuery(getPlaceByIdRepo(placeId))
  if (error) {
    return { data: null, error }
  }
  return { data: place, error: null }
}

export async function updatePlaceService(
  data: UpdatePlaceServer,
  userId: string,
) {
  const { id, categories, longitude, latitude, images, ...placeData } = data

  const newPlaceData = {
    ...placeData,
    longitude: Number(longitude),
    latitude: Number(latitude),
  }

  // const dataMap: any = {};
  const [_, updateError] = await safeDbQuery(
    updatePlaceRepo(id, userId, newPlaceData),
  )
  if (updateError) {
    return { message: null, error: updateError }
  }

  if (categories && categories.length !== 0) {
    const [_, deleteCategoriesError] = await safeDbQuery(
      deletePlaceCategoriesRepo(id),
    )
    if (deleteCategoriesError) {
      return { message: null, error: deleteCategoriesError }
    }

    const categoryData = categories.map((c) => {
      return { placeId: id, categoryId: c }
    })
    const [__, addCategoriesErr] = await safeDbQuery(
      insertCategoriesRepo(categoryData),
    )
    if (addCategoriesErr) {
      return { message: null, error: addCategoriesErr }
    }
  }

  // Handle images update
  if (images !== undefined) {
    // Delete existing images
    const [__, deleteImagesError] = await safeDbQuery(deletePlaceImagesRepo(id))
    if (deleteImagesError) {
      return { message: null, error: deleteImagesError }
    }

    // Insert new images if any
    if (images && images.length > 0) {
      const imageData = images.map((url: string) => {
        return { placeId: id, url, alt: placeData.name || "Place image" }
      })
      const [___, addImagesErr] = await safeDbQuery(insertImageRepo(imageData))
      if (addImagesErr) {
        return { message: null, error: addImagesErr }
      }
    }
  }

  return { message: "Successful update place", error: null }
}

// Separate service for updating place images only
export async function updatePlaceImagesService(
  placeId: string,
  images: Array<string>,
) {
  // Delete existing images
  const [_, deleteImagesError] = await safeDbQuery(
    deletePlaceImagesRepo(placeId),
  )
  if (deleteImagesError) {
    return { message: null, error: deleteImagesError }
  }

  // Insert new images if any
  if (images && images.length > 0) {
    const imageData = images.map((url: string) => {
      return { placeId, url, alt: "Place image" }
    })
    const [__, addImagesErr] = await safeDbQuery(insertImageRepo(imageData))
    if (addImagesErr) {
      return { message: null, error: addImagesErr }
    }
  }

  return { message: "Images updated successfully", error: null }
}

export async function getTotalPlacesService({
  filter,
}: {
  filter: SQL<unknown> | undefined
}) {
  const [total, totalErr] = await safeDbQuery(getTotalPlaceRepo(filter))
  if (totalErr) {
    return { message: totalErr.message, error: totalErr.error.cause }
  }
  return { message: "success get total", data: { count: total[0].count } }
}

export async function getPlacesService({
  filter,
  sortBy,
  sortOrder,
  limit,
  offset,
}: {
  filter: SQL<unknown> | undefined
  sortBy: string | undefined
  sortOrder: string | undefined
  limit: number
  offset: number
}) {
  // Optimize: Use a single query with subquery for better performance
  const [result, resultErr] = await safeDbQuery(
    getPlacesRepo({ sortBy, filter, limit, offset, sortOrder }),
  )

  if (resultErr) {
    return { message: resultErr.message, error: resultErr.error }
  }
  return { message: "Success", data: result }
}

export async function getPlacesForIndexService(
  categoryFilter?: string,
  searchQuery?: string,
  page: number = 1,
  limit: number = 1,
) {
  const offset = (page - 1) * limit

  // Get total count with filters
  const [countResult, countError] = await safeDbQuery(
    getPlacesCountWithFiltersRepo(categoryFilter, searchQuery),
  )
  if (countError) {
    return {
      places: [],
      totalCount: 0,
      currentPage: page,
      totalPage: 0,
      hasLeft: false,
      hasMore: false,
      error: countError,
    }
  }

  // Get paginated places
  const [result, error] = await safeDbQuery(
    getPlacesWithDetailsRepo(categoryFilter, searchQuery, limit, offset),
  )
  if (error) {
    return {
      places: [],
      totalCount: 0,
      currentPage: page,
      totalPage: 0,
      hasLeft: false,
      hasMore: false,
      error,
    }
  }

  // Transform the result to match the expected format
  const placesWithDetails = result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    location: {
      latitude: row.latitude || 0,
      longitude: row.longitude || 0,
      address: row.streetAddress || "",
      city: row.city || "",
      state: row.stateProvince || "",
      country: row.country || "",
    },
    categories: row.categories || [],
    images: row.first_image && row.first_image.id ? [row.first_image] : [],
    rating: row.rating,
    reviewCount: row.reviewCount,
    amenities: (row.amenities || []).map((amenity: string, index: number) => ({
      id: index.toString(),
      name: amenity,
      icon: amenity.toLowerCase().replace(/\s+/g, "-"),
    })),
    difficulty: row.difficulty,
    duration: row.duration,
    distance: row.distance,
    elevation: row.elevation,
    bestSeason: row.bestSeason,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
  }))

  const totalCount = Number(countResult[0].count)
  const totalPage = Math.ceil(totalCount / limit)

  return {
    places: placesWithDetails,
    totalCount,
    currentPage: page,
    totalPage,
    hasLeft: page > 1,
    hasMore: page < totalPage,
    error: null,
  }
}

export async function getFeaturedPlacesService(limit: number = 8) {
  const [result, error] = await safeDbQuery(getFeaturedPlacesRepo(limit))
  if (error) {
    return { data: null, error }
  }
  // Transform the result to match the expected format
  const placesWithDetails = result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    location: {
      latitude: row.latitude || 0,
      longitude: row.longitude || 0,
      address: row.streetAddress || "",
      city: row.city || "",
      state: row.stateProvince || "",
      country: row.country || "",
    },
    categories: row.categories || [],
    images: row.first_image && row.first_image.id ? [row.first_image] : [],
    rating: row.rating,
    reviewCount: row.reviewCount,
    amenities: (row.amenities || []).map((amenity: string, index: number) => ({
      id: index.toString(),
      name: amenity,
      icon: amenity.toLowerCase().replace(/\s+/g, "-"),
    })),
    difficulty: row.difficulty,
    duration: row.duration,
    distance: row.distance,
    elevation: row.elevation,
    bestSeason: row.bestSeason,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
  }))

  return { data: placesWithDetails, error: null }
}

export type PlaceByBoundsData = {
  id: string
  name: string | null
  description: string | null
  latitude: number | null
  longitude: number | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  country: string | null
  rating: number | null
  reviewCount: number | null
  difficulty: string | null
  distance: string | null
  isFeatured: boolean | null
  first_image: {
    id: string
    url: string
    alt: string | null
  } | null
}

export type PlaceByBounds = Awaited<ReturnType<typeof getPlacesByBoundsService>>

export async function getPlacesByBoundsService(bounds: {
  north: number
  south: number
  east: number
  west: number
}) {
  const [result, error] = await safeDbQuery(getPlacesByBoundsRepo(bounds))
  if (error) {
    return { data: null, error }
  }
  return {
    data: result.rows as unknown as Array<PlaceByBoundsData>,
    error: null,
  }
}
