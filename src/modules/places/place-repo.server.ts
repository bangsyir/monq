import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import type { FeaturedPlace, PlaceWithDetailsRaw } from "./place-types"
import type { InferInsertModel, SQL } from "drizzle-orm"
import { createDb } from "@/db"
import { categories, placeCategories, placeImages, places } from "@/db/schema"

type InsertPlace = InferInsertModel<typeof places>
type InsertCategories = InferInsertModel<typeof placeCategories>
type InserImage = InferInsertModel<typeof placeImages>

export function insertPlaceRepo(
  data: Omit<InsertPlace, "userId">,
  userId: string,
) {
  const db = createDb()
  return db
    .insert(places)
    .values({
      userId: userId,
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      postcode: data.postcode,
      city: data.city,
      stateProvince: data.stateProvince,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      difficulty: data.difficulty,
      duration: data.duration,
      distance: data.distance,
      rating: 0,
      amenities: data.amenities || [],
      isFeatured: data.isFeatured,
    })
    .returning({ id: places.id, title: places.name })
}

export function insertCategoriesRepo(data: Array<InsertCategories>) {
  const db = createDb()
  return db.insert(placeCategories).values(data)
}

export function insertImageRepo(data: Array<InserImage>) {
  const db = createDb()
  return db.insert(placeImages).values(data)
}

export function getPlaceByIdRepo(placeId: string) {
  const db = createDb()
  const place = db.query.places.findFirst({
    where: eq(places.id, placeId),
    with: {
      placeCategories: {
        with: {
          category: true,
        },
      },
      images: true,
    },
  })

  return place
}

export function updatePlaceRepo(
  placeId: string,
  userId: string,
  data: Omit<InsertPlace, "userId" | "rating">,
) {
  const db = createDb()
  return db
    .update(places)
    .set({
      userId: userId,
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      postcode: data.postcode,
      city: data.city,
      stateProvince: data.stateProvince,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      difficulty: data.difficulty,
      duration: data.duration,
      distance: data.distance,
      amenities: data.amenities,
      isFeatured: data.isFeatured,
    })
    .where(and(eq(places.id, placeId), eq(places.userId, userId)))
    .returning({ id: places.id, title: places.name })
}

export function deletePlaceCategoriesRepo(placeId: string) {
  const db = createDb()
  return db.delete(placeCategories).where(eq(placeCategories.placeId, placeId))
}

export function deletePlaceImagesRepo(placeId: string) {
  const db = createDb()
  return db.delete(placeImages).where(eq(placeImages.placeId, placeId))
}

export function deletePlaceImageRepo(imageId: string) {
  const db = createDb()
  return db.delete(placeImages).where(eq(placeImages.id, imageId))
}

export function getFeaturedPlacesRepo(limit: number = 8) {
  const db = createDb()
  // PostgreSQL JSON aggregation query for featured places
  const result = db.execute(sql<FeaturedPlace>`
    SELECT 
      ${places.id},
      ${places.name},
      ${places.description},
      ${places.latitude},
      ${places.longitude},
      ${places.streetAddress},
      ${places.city},
      ${places.stateProvince},
      ${places.country},
      ${places.rating},
      ${places.reviewCount},
      ${places.difficulty},
      ${places.duration},
      ${places.distance},
      ${places.elevation},
      ${places.bestSeason},
      ${places.amenities},
      ${places.isFeatured},
      ${places.createdAt},
      ${places.updatedAt},
      COALESCE(
        JSON_AGG(DISTINCT ${categories.name}) FILTER (WHERE ${categories.name} IS NOT NULL),
        '[]'::json
      ) as categories,
      (
        SELECT JSON_BUILD_OBJECT(
          'id', ${placeImages.id},
          'url', ${placeImages.url},
          'alt', ''
        )
        FROM ${placeImages}
        WHERE ${placeImages.placeId} = ${places.id}
        LIMIT 1
      ) as first_image
    FROM ${places}
    LEFT JOIN ${placeCategories} ON ${places.id} = ${placeCategories.placeId}
    LEFT JOIN ${categories} ON ${placeCategories.categoryId} = ${categories.id}
    WHERE ${places.isFeatured} = true
    GROUP BY ${places.id}
    ORDER BY ${places.rating} DESC
    LIMIT ${limit}
  `)
  return result
}

export function getPlacesWithDetailsRepo(
  categoryFilter?: string,
  searchQuery?: string,
  limit?: number,
  offset?: number,
) {
  const db = createDb()
  // Build category filter using EXISTS subquery for database-level filtering
  let categoryCondition = sql`TRUE`
  if (categoryFilter && categoryFilter !== "all") {
    categoryCondition = sql`EXISTS (
      SELECT 1 FROM ${placeCategories}
      INNER JOIN ${categories} ON ${placeCategories.categoryId} = ${categories.id}
      WHERE ${placeCategories.placeId} = ${places.id}
      AND LOWER(${categories.name}) = LOWER(${categoryFilter})
    )`
  }

  // Build search filter using ILIKE for database-level text search
  let searchCondition = sql`TRUE`
  if (searchQuery && searchQuery.trim() !== "") {
    const searchTerm = searchQuery.trim()
    searchCondition = sql`(
      ${places.name} ILIKE ${`%${searchTerm}%`} OR
      ${places.description} ILIKE ${`%${searchTerm}%`} OR
      ${places.city} ILIKE ${`%${searchTerm}%`} OR
      ${places.stateProvince} ILIKE ${`%${searchTerm}%`} OR
      ${places.country} ILIKE ${`%${searchTerm}%`} OR
      ${places.streetAddress} ILIKE ${`%${searchTerm}%`}
    )`
  }

  // Combine conditions
  const whereCondition = sql`${categoryCondition} AND ${searchCondition}`

  // PostgreSQL JSON aggregation query - single query, no duplicates
  return db.execute(sql<PlaceWithDetailsRaw>`
    SELECT 
      ${places.id},
      ${places.name},
      ${places.description},
      ${places.latitude},
      ${places.longitude},
      ${places.streetAddress},
      ${places.city},
      ${places.stateProvince},
      ${places.country},
      ${places.rating},
      ${places.reviewCount},
      ${places.difficulty},
      ${places.duration},
      ${places.distance},
      ${places.elevation},
      ${places.bestSeason},
      ${places.amenities},
      ${places.isFeatured},
      ${places.createdAt},
      ${places.updatedAt},
      COALESCE(
        JSON_AGG(DISTINCT ${categories.name}) FILTER (WHERE ${categories.name} IS NOT NULL),
        '[]'::json
      ) as categories,
      (
        SELECT JSON_BUILD_OBJECT(
          'id', ${placeImages.id},
          'url', ${placeImages.url},
          'alt', ''
        )
        FROM ${placeImages}
        WHERE ${placeImages.placeId} = ${places.id}
        LIMIT 1
      ) as first_image
    FROM ${places}
    LEFT JOIN ${placeCategories} ON ${places.id} = ${placeCategories.placeId}
    LEFT JOIN ${categories} ON ${placeCategories.categoryId} = ${categories.id}
    WHERE ${whereCondition}
    GROUP BY ${places.id}
    LIMIT ${limit}
    offset ${offset}
  `)
}

export function placeConditionFilterRepo(search: string | undefined) {
  const whereConditions = search
    ? or(
        ilike(places.name, `%${search}%`),
        ilike(places.description, `%${search}%`),
        ilike(places.city, `%${search}%`),
        ilike(places.stateProvince, `%${search}%`),
        ilike(places.country, `%${search}%`),
      )
    : undefined
  return whereConditions
}
export function getPlacesRepo({
  sortBy,
  sortOrder,
  filter,
  limit,
  offset,
}: {
  sortBy: string | undefined
  sortOrder: string | undefined
  filter: SQL<unknown> | undefined
  limit: number
  offset: number
}) {
  const db = createDb()
  // Determine sort column
  const sortColumn =
    sortBy === "name"
      ? places.name
      : sortBy === "rating"
        ? places.rating
        : sortBy === "city"
          ? places.city
          : places.createdAt

  return db
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
    .offset(offset)
}

export function getTotalPlaceRepo(filter: SQL<unknown> | undefined) {
  const db = createDb()
  return db.select({ count: count() }).from(places).where(filter)
}

export function getPlacesCountWithFiltersRepo(
  categoryFilter?: string,
  searchQuery?: string,
) {
  const db = createDb()
  // Build category filter using EXISTS subquery
  let categoryCondition = sql`TRUE`
  if (categoryFilter && categoryFilter !== "all") {
    categoryCondition = sql`EXISTS (
      SELECT 1 FROM ${placeCategories}
      INNER JOIN ${categories} ON ${placeCategories.categoryId} = ${categories.id}
      WHERE ${placeCategories.placeId} = ${places.id}
      AND LOWER(${categories.name}) = LOWER(${categoryFilter})
    )`
  }

  // Build search filter using ILIKE
  let searchCondition = sql`TRUE`
  if (searchQuery && searchQuery.trim() !== "") {
    const searchTerm = searchQuery.trim()
    searchCondition = sql`(
      ${places.name} ILIKE ${`%${searchTerm}%`} OR
      ${places.description} ILIKE ${`%${searchTerm}%`} OR
      ${places.city} ILIKE ${`%${searchTerm}%`} OR
      ${places.stateProvince} ILIKE ${`%${searchTerm}%`} OR
      ${places.country} ILIKE ${`%${searchTerm}%`} OR
      ${places.streetAddress} ILIKE ${`%${searchTerm}%`}
    )`
  }

  // Combine conditions
  const whereCondition = sql`${categoryCondition} AND ${searchCondition}`

  return db.select({ count: count() }).from(places).where(whereCondition)
}

export function getPlacesByBoundsRepo(bounds: {
  north: number
  south: number
  east: number
  west: number
}) {
  const db = createDb()
  return db.execute(sql<any>`
    SELECT 
      ${places.id},
      ${places.name},
      ${places.description},
      ${places.latitude},
      ${places.longitude},
      ${places.streetAddress},
      ${places.city},
      ${places.stateProvince},
      ${places.country},
      ${places.rating},
      ${places.reviewCount},
      ${places.difficulty},
      ${places.distance},
      ${places.isFeatured},
      (
        SELECT JSON_BUILD_OBJECT(
          'id', ${placeImages.id},
          'url', ${placeImages.url},
          'alt', ${placeImages.alt}
        )
        FROM ${placeImages}
        WHERE ${placeImages.placeId} = ${places.id}
        LIMIT 1
      ) as first_image
    FROM ${places}
    WHERE ${places.latitude} BETWEEN ${bounds.south} AND ${bounds.north} 
      AND ${places.longitude} BETWEEN ${bounds.west} AND ${bounds.east}
  `)
}
