import { and, eq, sql } from "drizzle-orm"
import type { InferInsertModel } from "drizzle-orm"
import { db } from "@/db"
import { categories, placeCategories, placeImages, places } from "@/db/schema"

type InsertPlace = InferInsertModel<typeof places>
type InsertCategories = InferInsertModel<typeof placeCategories>
type InserImage = InferInsertModel<typeof placeImages>

export async function insertPlace(
  data: Omit<InsertPlace, "userId">,
  userId: string,
) {
  return await db
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
    })
    .returning({ id: places.id, title: places.name })
}

export function insertCategories(data: Array<InsertCategories>) {
  return db.insert(placeCategories).values(data)
}

export function insertImage(data: Array<InserImage>) {
  return db.insert(placeImages).values(data)
}

export async function getPlaceById(placeId: string) {
  const place = await db.query.places.findFirst({
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

export async function updatePlace(
  placeId: string,
  userId: string,
  data: Omit<InsertPlace, "userId" | "rating">,
) {
  return await db
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
    })
    .where(and(eq(places.id, placeId), eq(places.userId, userId)))
    .returning({ id: places.id, title: places.name })
}

export async function deletePlaceCategories(placeId: string) {
  return await db
    .delete(placeCategories)
    .where(eq(placeCategories.placeId, placeId))
}

export async function deletePlaceImages(placeId: string) {
  return await db.delete(placeImages).where(eq(placeImages.placeId, placeId))
}

export async function deletePlaceImage(imageId: string) {
  return await db.delete(placeImages).where(eq(placeImages.id, imageId))
}

export async function getPlacesWithDetails(
  placeIds?: Array<string>,
  categoryFilter?: string,
) {
  // Build WHERE conditions for place IDs
  let placeIdCondition = sql`TRUE`
  if (placeIds && placeIds.length > 0) {
    placeIdCondition = sql`${places.id} IN (${sql.join(
      placeIds.map((id) => sql`${id}`),
      sql`, `,
    )})`
  }

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

  // PostgreSQL JSON aggregation query - single query, no duplicates
  const result = await db.execute(sql`
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
    WHERE ${placeIdCondition} AND ${categoryCondition}
    GROUP BY ${places.id}
  `)

  // Transform the result to match the expected format
  const placesWithDetails = (result as Array<any>).map((row: any) => ({
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

  return placesWithDetails
}
