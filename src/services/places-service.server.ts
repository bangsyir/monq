import { asc, count, desc } from "drizzle-orm"
import type { SQL } from "drizzle-orm"
import type { AddPlaceServer, UpdatePlaceServer } from "@/schema/place-schema"
import {
  deletePlaceCategories,
  getPlaceById,
  insertCategories,
  insertImage,
  insertPlace,
  updatePlace,
} from "@/repositories/place-repo"
import { safeDbQuery } from "@/utils/safe-db-query"
import { db } from "@/db"
import { categories, places } from "@/db/schema"

// Utility function to convert amenities objects to string format for database
function convertAmenitiesToStrings(
  amenities?: Array<{ name: string; icon: string }>,
): Array<string> {
  return amenities ? amenities.map((a) => `${a.name}:${a.icon}`) : []
}

// Helper function to get category IDs by names
async function getCategoryIdsByName(
  categoryNames: Array<string>,
): Promise<Array<string>> {
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

export async function createPlace(data: AddPlaceServer, userId: string) {
  const dataMap = {
    name: data.name,
    description: data.description,
    address: data.streetAddress,
    city: data.city,
    state: data.stateProvince,
    country: data.country,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    difficulty: data.difficulty,
    duration: data.duration,
    distance: data.distance,
    rating: 0,
    amenities: convertAmenitiesToStrings(data.amenities),
  }
  const [addPlace, addPlaceError] = await safeDbQuery(
    insertPlace(dataMap, userId),
  )
  if (addPlaceError) {
    return addPlaceError
  }
  const categoryIds = await getCategoryIdsByName(data.categories)
  const placeCategoryRelations = categoryIds.map((categoryId: string) => {
    return { placeId: addPlace[0].id, categoryId }
  })
  const [_, addCategoriesErr] = await safeDbQuery(
    insertCategories(placeCategoryRelations),
  )
  if (addCategoriesErr) {
    return addCategoriesErr
  }
  if (data.images?.length !== 0) {
    const images =
      data.images?.map((c: string) => {
        return { placeId: addPlace[0].id, url: c, alt: addPlace[0].title }
      }) || []
    const [__, addImagesErr] = await safeDbQuery(insertImage(images))
    if (addImagesErr) {
      return addImagesErr
    }
  }

  return { message: "Successful update place", error: null }
}

export async function getPlace(placeId: string) {
  const [place, error] = await safeDbQuery(getPlaceById(placeId))
  if (error) {
    return { data: null, error }
  }
  return { data: place, error: null }
}

export async function updatePlaceService(
  data: UpdatePlaceServer,
  userId: string,
) {
  const { id, categories, longitude, latitude, amenities, ...placeData } = data

  const newPlaceData = {
    ...placeData,
    longitude: Number(longitude),
    latitude: Number(latitude),
  }

  // const dataMap: any = {};
  const [_, updateError] = await safeDbQuery(
    updatePlace(id, userId, newPlaceData),
  )
  if (updateError) {
    return { message: null, error: updateError }
  }

  if (categories.length !== 0) {
    const [_, deleteCategoriesError] = await safeDbQuery(
      deletePlaceCategories(id),
    )
    if (deleteCategoriesError) {
      return { message: null, error: deleteCategoriesError }
    }

    const categoryData = categories.map((c) => {
      return { placeId: id, categoryId: c }
    })
    const [__, addCategoriesErr] = await safeDbQuery(
      insertCategories(categoryData),
    )
    if (addCategoriesErr) {
      return { message: null, error: addCategoriesErr }
    }
  }

  return { message: "Successful update place", error: null }
}

export async function getTotalPlaces({
  filter,
}: {
  filter: SQL<unknown> | undefined
}) {
  const [total, totalErr] = await safeDbQuery(
    db.select({ count: count() }).from(places).where(filter),
  )
  if (totalErr) {
    return { message: totalErr.message, error: totalErr.error.cause }
  }
  return { message: "success get total", data: { count: total[0].count } }
}

export async function getPlaces({
  filter,
  sortBy,
  sortOrder,
  limit,
  offset,
}: {
  filter: SQL<unknown> | undefined
  sortBy: string
  sortOrder: string
  limit: number
  offset: number
}) {
  // Determine sort column
  const sortColumn =
    sortBy === "name"
      ? places.name
      : sortBy === "rating"
        ? places.rating
        : sortBy === "city"
          ? places.city
          : places.createdAt

  // Optimize: Use a single query with subquery for better performance
  const [result, resultErr] = await safeDbQuery(
    db
      .select({
        // Place fields
        id: places.id,
        name: places.name,
        description: places.description,
        latitude: places.latitude,
        longitude: places.longitude,
        address: places.streetAddress,
        city: places.city,
        state: places.stateProvince,
        country: places.country,
        rating: places.rating,
        reviewCount: places.reviewCount,
        difficulty: places.difficulty,
        duration: places.duration,
        distance: places.distance,
        elevation: places.elevation,
        bestSeason: places.bestSeason,
        isFeatured: places.isFeatured,
        createdAt: places.createdAt,
        updatedAt: places.updatedAt,
        userId: places.userId,
        // Total count using window function
      })
      .from(places)
      .where(filter)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset),
  )
  if (resultErr) {
    return { message: resultErr.message, error: resultErr.error }
  }
  return { message: "Success", data: result }
}
