import {
  deleteRatingRepo,
  getRatingStatsRepo,
  getUserRatingRepo,
  insertRatingRepo,
  updateRatingRepo,
} from "./rating-repo.server"
import type { AddRatingData, UserRating } from "./rating-types"
import { safeDbQuery } from "@/utils/safe-db-query"

export async function getUserRatingService(
  placeId: string,
  userId: string,
): Promise<{ error: { message: string } | null; data?: UserRating | null }> {
  const [result, error] = await safeDbQuery(getUserRatingRepo(placeId, userId))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result || null,
  }
}

export async function addRatingService(
  data: AddRatingData,
): Promise<{ error: { message: string } | null; data?: UserRating }> {
  const [existingRating] = await safeDbQuery(
    getUserRatingRepo(data.placeId, data.userId),
  )
  if (existingRating) {
    return {
      error: { message: "You have already rated this place" },
    }
  }

  const [result, error] = await safeDbQuery(insertRatingRepo(data))
  if (error) {
    return { error: { message: error.message } }
  }
  return {
    error: null,
    data: result[0],
  }
}

export async function updateRatingService(
  placeId: string,
  userId: string,
  rating: number,
): Promise<{ error: { message: string } | null; data?: UserRating }> {
  const [existingRating] = await safeDbQuery(getUserRatingRepo(placeId, userId))

  if (!existingRating) {
    return {
      error: { message: "You have not rated this place yet" },
    }
  }

  const [result, error] = await safeDbQuery(
    updateRatingRepo(placeId, userId, rating),
  )

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result[0],
  }
}

export async function deleteRatingService(
  placeId: string,
  userId: string,
): Promise<{ error: { message: string } | null; data?: { id: string } }> {
  const [existingRating] = await safeDbQuery(getUserRatingRepo(placeId, userId))

  if (!existingRating) {
    return {
      error: { message: "You have not rated this place yet" },
    }
  }

  const [result, error] = await safeDbQuery(deleteRatingRepo(placeId, userId))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result[0],
  }
}

export async function getRatingStatsService(placeId: string): Promise<{
  error: { message: string } | null
  data?: { ratingSum: number; ratingCount: number; avgRating: number } | null
}> {
  const [result, error] = await safeDbQuery(getRatingStatsRepo(placeId))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result
      ? {
          ratingSum: Number(result.ratingSum) || 0,
          ratingCount: Number(result.ratingCount) || 0,
          avgRating: Number(result.avgRating) || 0,
        }
      : null,
  }
}
