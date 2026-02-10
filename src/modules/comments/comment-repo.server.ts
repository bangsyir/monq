import { and, count, desc, eq, inArray, isNull } from "drizzle-orm"
import type { AddCommentData, AddReplyData } from "./comment-types"
import { db } from "@/db"
import { comments } from "@/db/schema"

export async function insertCommentRepo(data: AddCommentData) {
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

export async function getCommentsWithUserRepo(
  placeId: string,
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit

  // Get comments (top-level only, parentId is null)
  const commentsData = await db.query.comments.findMany({
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

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.placeId, placeId), isNull(comments.parentId)))

  // Get reply counts for each comment
  const commentIds = commentsData.slice(0, limit).map((c) => c.id)

  let replyCountMap = new Map<string, number>()
  if (commentIds.length > 0) {
    const replyCounts = await db
      .select({
        parentId: comments.parentId,
        count: count(),
      })
      .from(comments)
      .where(inArray(comments.parentId, commentIds))
      .groupBy(comments.parentId)

    replyCountMap = new Map(replyCounts.map((rc) => [rc.parentId!, rc.count]))
  }

  const hasMore = commentsData.length > limit
  const result = commentsData.slice(0, limit).map((comment) => ({
    ...comment,
    replyCount: replyCountMap.get(comment.id) || 0,
  }))

  return {
    comments: result,
    hasMore,
    totalCount: totalResult?.count || 0,
  }
}

export async function getRepliesWithUserRepo(
  parentId: string,
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit

  const repliesData = await db.query.comments.findMany({
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
  })

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.parentId, parentId))

  const hasMore = repliesData.length > limit

  return {
    replies: repliesData.slice(0, limit),
    hasMore,
    totalCount: totalResult?.count || 0,
  }
}
