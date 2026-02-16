import { and, count, desc, eq, inArray, isNull } from "drizzle-orm"
import type { AddCommentData, AddReplyData } from "./comment-types"
import { createDb } from "@/db"
import { comments } from "@/db/schema"

export async function insertCommentRepo(data: AddCommentData) {
  const db = createDb()
  return db
    .insert(comments)
    .values({
      placeId: data.placeId,
      userId: data.userId,
      comment: data.comment,
    })
    .returning({
      id: comments.id,
      placeId: comments.placeId,
      userId: comments.userId,
      parentId: comments.parentId,
      comment: comments.comment,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
}

export async function insertReplyRepo(data: AddReplyData) {
  const db = createDb()
  return db
    .insert(comments)
    .values({
      placeId: data.placeId,
      userId: data.userId,
      parentId: data.parentId,
      comment: data.comment,
    })
    .returning({
      id: comments.id,
      placeId: comments.placeId,
      userId: comments.userId,
      parentId: comments.parentId,
      comment: comments.comment,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
}
// get comments with user repo
export function getCommentsRepo(
  placeId: string,
  limit: number,
  offset: number,
) {
  const db = createDb()
  return db.query.comments.findMany({
    where: and(eq(comments.placeId, placeId), isNull(comments.parentId)),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: desc(comments.createdAt),
    limit: limit + 1,
    offset: offset,
  })
}

export function getCommentsTotalRepo(placeId: string) {
  const db = createDb()
  return db
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.placeId, placeId), isNull(comments.parentId)))
}

export function getCommentsReplyCountRepo(commentIds: Array<string>) {
  const db = createDb()
  return db
    .select({
      parentId: comments.parentId,
      count: count(),
    })
    .from(comments)
    .where(inArray(comments.parentId, commentIds))
    .groupBy(comments.parentId)
}

export function getRepliesRepo(
  parentId: string,
  limit: number,
  offset: number,
) {
  const db = createDb()
  return Promise.all([
    db.query.comments.findMany({
      where: eq(comments.parentId, parentId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: desc(comments.createdAt),
      limit: limit + 1,
      offset: offset,
    }),
    db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.parentId, parentId)),
  ])
}

export function getCommentByIdRepo(commentId: string) {
  const db = createDb()
  return db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      place: {
        columns: {
          id: true,
          name: true,
          rating: true,
          reviewCount: true,
          streetAddress: true,
          city: true,
          stateProvince: true,
          country: true,
        },
        with: {
          images: {
            columns: {
              id: true,
              url: true,
            },
            limit: 1,
          },
        },
      },
    },
  })
}
