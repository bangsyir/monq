import { and, eq, sql } from "drizzle-orm"
import type { AddRatingData } from "./rating-types"
import { createDb } from "@/db"
import { places, reviews } from "@/db/schema"

export function getUserRatingRepo(placeId: string, userId: string) {
  const db = createDb()
  return db.query.reviews.findFirst({
    where: and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)),
    columns: {
      id: true,
      placeId: true,
      userId: true,
      rating: true,
      createdAt: true,
    },
  })
}

export async function insertRatingRepo(data: AddRatingData) {
  const db = createDb()

  const updateRating = db.$with("update_rating").as(
    db
      .update(places)
      .set({
        ratingCount: sql`${places.ratingCount} + 1`,
        ratingSum: sql`${places.ratingSum} + ${data.rating}`,
        avgRating: sql`(${places.ratingSum} + ${data.rating})::numeric / (${places.ratingCount} + 1)`,
      })
      .where(eq(places.id, data.placeId)),
  )

  return db
    .with(updateRating)
    .insert(reviews)
    .values({
      placeId: data.placeId,
      userId: data.userId,
      rating: data.rating,
    })
    .returning({
      id: reviews.id,
      placeId: reviews.placeId,
      userId: reviews.userId,
      rating: reviews.rating,
      createdAt: reviews.createdAt,
    })
}

export async function getExistingRatingRepo(placeId: string, userId: string) {
  const db = createDb()
  return db.query.reviews.findFirst({
    where: and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)),
  })
}

export async function updateRatingRepo(
  placeId: string,
  userId: string,
  newRating: number,
) {
  const db = createDb()

  const getOldRating = db.$with("get_old_rating").as(
    db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(and(eq(reviews.placeId, placeId), eq(reviews.userId, userId))),
  )

  const updatePlacesWithDiff = db.$with("update_places_with_diff").as(
    db
      .with(getOldRating)
      .update(places)
      .set({
        ratingSum: sql`${places.ratingSum} - (SELECT rating FROM get_old_rating) + ${newRating}`,
        avgRating: sql`CASE WHEN ${places.ratingCount} > 0 THEN (${places.ratingSum} - (SELECT rating FROM get_old_rating) + ${newRating})::numeric / ${places.ratingCount} ELSE 0 END`,
      })
      .where(eq(places.id, placeId)),
  )

  return db
    .with(getOldRating, updatePlacesWithDiff)
    .update(reviews)
    .set({ rating: newRating })
    .where(and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)))
    .returning({
      id: reviews.id,
      placeId: reviews.placeId,
      userId: reviews.userId,
      rating: reviews.rating,
      createdAt: reviews.createdAt,
    })
}

export async function deleteRatingRepo(placeId: string, userId: string) {
  const db = createDb()

  const getDeletedRating = db.$with("get_deleted_rating").as(
    db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(and(eq(reviews.placeId, placeId), eq(reviews.userId, userId))),
  )

  const updatePlacesAfterDelete = db.$with("update_places_after_delete").as(
    db
      .with(getDeletedRating)
      .update(places)
      .set({
        ratingCount: sql`${places.ratingCount} - 1`,
        ratingSum: sql`${places.ratingSum} - (SELECT rating FROM get_deleted_rating)`,
        avgRating: sql`CASE WHEN (${places.ratingCount} - 1) = 0 THEN 0 ELSE (${places.ratingSum} - (SELECT rating FROM get_deleted_rating))::numeric / (${places.ratingCount} - 1) END`,
      })
      .where(eq(places.id, placeId)),
  )

  const result = await db
    .with(getDeletedRating, updatePlacesAfterDelete)
    .delete(reviews)
    .where(and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)))
    .returning({ id: reviews.id })

  return result
}

export function getRatingStatsRepo(placeId: string) {
  const db = createDb()
  return db.query.places.findFirst({
    where: eq(places.id, placeId),
    columns: {
      ratingSum: true,
      ratingCount: true,
      avgRating: true,
    },
  })
}
