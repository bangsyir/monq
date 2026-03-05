import { and, eq } from "drizzle-orm"
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
  const result = await db
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

  await db.execute(
    `UPDATE places SET rating_count = rating_count + 1, rating_sum = rating_sum + ${data.rating}, avg_rating = (rating_sum + ${data.rating})::numeric / (rating_count + 1) WHERE id = '${data.placeId}'`,
  )

  return result
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
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)),
  })

  if (!existing) {
    throw new Error("Rating not found")
  }

  const oldRating = existing.rating

  const result = await db
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

  await db.execute(
    `UPDATE places SET rating_sum = rating_sum - ${oldRating} + ${newRating}, avg_rating = (rating_sum - ${oldRating} + ${newRating})::numeric / NULLIF(rating_count, 0) WHERE id = '${placeId}'`,
  )

  return result
}

export async function deleteRatingRepo(placeId: string, userId: string) {
  const db = createDb()
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)),
  })

  if (!existing) {
    throw new Error("Rating not found")
  }

  const deletedRating = existing.rating

  const result = await db
    .delete(reviews)
    .where(and(eq(reviews.placeId, placeId), eq(reviews.userId, userId)))
    .returning({ id: reviews.id })

  await db.execute(
    `UPDATE places SET rating_count = rating_count - 1, rating_sum = rating_sum - ${deletedRating}, avg_rating = CASE WHEN (rating_count - 1) = 0 THEN 0 ELSE (rating_sum - ${deletedRating})::numeric / (rating_count - 1) END WHERE id = '${placeId}'`,
  )

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
