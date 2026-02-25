import { count } from "drizzle-orm"
import { createDb } from "@/db"
import { comments, places, reviews, users } from "@/db/schema"

export function getTotalUsersRepo() {
  const db = createDb()
  return db.select({ count: count() }).from(users)
}

export function getTotalPlacesRepo() {
  const db = createDb()
  return db.select({ count: count() }).from(places)
}

export function getTotalReviewsRepo() {
  const db = createDb()
  return db.select({ count: count() }).from(reviews)
}

export function getTotalCommentsRepo() {
  const db = createDb()
  return db.select({ count: count() }).from(comments)
}

export function getRecentReviewsRepo(limit: number = 5) {
  const db = createDb()
  return db.query.reviews.findMany({
    limit,
    orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    with: {
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
      place: {
        columns: {
          name: true,
        },
      },
    },
  })
}

export function getRecentPlacesRepo(limit: number = 5) {
  const db = createDb()
  return db.query.places.findMany({
    limit,
    orderBy: (places, { desc }) => [desc(places.createdAt)],
    columns: {
      id: true,
      name: true,
      city: true,
      rating: true,
      createdAt: true,
    },
  })
}

export function getRecentUsersRepo(limit: number = 5) {
  const db = createDb()
  return db.query.users.findMany({
    limit,
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    columns: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
}
