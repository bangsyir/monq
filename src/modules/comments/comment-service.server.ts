import {
  deleteCommentRepo,
  getCommentByIdRepo,
  getCommentsReplyCountRepo,
  getCommentsRepo,
  getCommentsTotalRepo,
  getRepliesRepo,
  insertCommentRepo,
  insertReplyRepo,
} from "./comment-repo.server"
import type {
  AddCommentData,
  AddReplyData,
  Comment as CommentType,
  PaginatedComments,
  PaginatedReplies,
} from "./comment-types"
import { safeDbQuery } from "@/utils/safe-db-query"

export async function createCommentService(
  data: AddCommentData,
): Promise<{ error: { message: string } | null; data?: { id: string } }> {
  const [result, error] = await safeDbQuery(insertCommentRepo(data))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: { id: result[0].id },
  }
}

export async function createReplyService(
  data: AddReplyData,
): Promise<{ error: { message: string } | null; data?: { id: string } }> {
  const [result, error] = await safeDbQuery(insertReplyRepo(data))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: { id: result[0].id },
  }
}

export async function getCommentsService(
  placeId: string,
  page: number,
  limit: number,
): Promise<{ error: { message: string } | null; data?: PaginatedComments }> {
  const offset = (page - 1) * limit

  const [[commentsData, commentsDataErr], [commentsTotal, commentsTotalErr]] =
    await Promise.all([
      safeDbQuery(getCommentsRepo(placeId, limit, offset)),
      safeDbQuery(getCommentsTotalRepo(placeId)),
    ])

  if (commentsDataErr || commentsTotalErr) {
    throw new Error(commentsDataErr?.message || commentsTotalErr?.message)
  }
  const commentIds = commentsData.slice(0, limit).map((c) => c.id)

  let replyCountMap = new Map<string, number>()
  if (commentIds.length > 0) {
    const [replyCounts, replyCountsErr] = await safeDbQuery(
      getCommentsReplyCountRepo(commentIds),
    )
    if (replyCountsErr) {
      throw new Error(replyCountsErr.message)
    }
    replyCountMap = new Map(replyCounts.map((rc) => [rc.parentId!, rc.count]))
  }
  const hasMore = commentsData.length > limit
  const result = commentsData.slice(0, limit).map((comment) => ({
    ...comment,
    replyCount: replyCountMap.get(comment.id) || 0,
  }))

  const data = {
    comments: result,
    hasMore,
    totalCount: commentsTotal[0].count || 0,
  }

  return {
    error: null,
    data: data,
  }
}

export async function getRepliesService(
  parentId: string,
  page: number,
  limit: number,
): Promise<{ error: { message: string } | null; data?: PaginatedReplies }> {
  const offset = (page - 1) * limit
  const [replies, repliesErr] = await safeDbQuery(
    getRepliesRepo(parentId, limit, offset),
  )
  if (repliesErr) {
    throw Error(repliesErr.message)
  }
  const hasMore = replies?.[0].length > limit

  const data = {
    replies: replies?.[0].slice(0, limit),
    hasMore,
    totalCount: replies[1][0].count || 0,
  }
  return {
    error: null,
    data: data,
  }
}

export async function getCommentByIdService(
  commentId: string,
): Promise<{ error: { message: string } | null; data?: CommentType | null }> {
  const [comment, error] = await safeDbQuery(getCommentByIdRepo(commentId))

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: comment,
  }
}

export async function deleteCommentService(
  commentId: string,
  userId: string,
): Promise<{ error: { message: string } | null; data?: { id: string } }> {
  const [result, error] = await safeDbQuery(
    deleteCommentRepo(commentId, userId),
  )

  if (error) {
    return { error: { message: error.message } }
  }

  if (!result || result.length === 0) {
    return {
      error: {
        message: "Comment not found or you don't have permission to delete it",
      },
    }
  }

  return {
    error: null,
    data: { id: result[0].id },
  }
}
