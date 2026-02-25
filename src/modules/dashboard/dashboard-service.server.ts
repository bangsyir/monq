import {
  getRecentPlacesRepo,
  getRecentReviewsRepo,
  getRecentUsersRepo,
  getTotalCommentsRepo,
  getTotalPlacesRepo,
  getTotalReviewsRepo,
  getTotalUsersRepo,
} from "./dashboard-repo.server"
import type { TAppError } from "@/utils/safe-db-query"
import { safeDbQuery } from "@/utils/safe-db-query"

export interface DashboardStats {
  totalUsers: number
  totalPlaces: number
  totalReviews: number
  totalComments: number
}

export async function getDashboardStatsService(): Promise<
  DashboardStats | TAppError
> {
  const [
    [usersResult, usersError],
    [placesResult, placesError],
    [reviewsResult, reviewsError],
    [commentsResult, commentsError],
  ] = await Promise.all([
    safeDbQuery(getTotalUsersRepo()),
    safeDbQuery(getTotalPlacesRepo()),
    safeDbQuery(getTotalReviewsRepo()),
    safeDbQuery(getTotalCommentsRepo()),
  ])

  const firstError = usersError || placesError || reviewsError || commentsError
  if (firstError) {
    return firstError
  }

  return {
    totalUsers: usersResult[0]?.count ?? 0,
    totalPlaces: placesResult[0]?.count ?? 0,
    totalReviews: reviewsResult[0]?.count ?? 0,
    totalComments: commentsResult[0]?.count ?? 0,
  }
}

export async function getRecentDataService(): Promise<
  | {
      recentReviews: Array<object>
      recentPlaces: Array<object>
      recentUsers: Array<object>
    }
  | TAppError
> {
  const [[reviews, reviewsError], [places, placesError], [users, usersError]] =
    await Promise.all([
      safeDbQuery(getRecentReviewsRepo(5)),
      safeDbQuery(getRecentPlacesRepo(5)),
      safeDbQuery(getRecentUsersRepo(5)),
    ])

  const firstError = reviewsError || placesError || usersError
  if (firstError) {
    return firstError
  }

  return {
    recentReviews: reviews as Array<object>,
    recentPlaces: places as Array<object>,
    recentUsers: users as Array<object>,
  }
}
