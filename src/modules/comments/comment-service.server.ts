import {
  getCommentsWithUserRepo,
  getRepliesWithUserRepo,
  insertCommentRepo,
  insertReplyRepo,
} from "./comment-repo.server"
import type {
  AddCommentData,
  AddReplyData,
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
  const [result, error] = await safeDbQuery(
    getCommentsWithUserRepo(placeId, page, limit),
  )

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result,
  }
}

export async function getRepliesService(
  parentId: string,
  page: number,
  limit: number,
): Promise<{ error: { message: string } | null; data?: PaginatedReplies }> {
  const [result, error] = await safeDbQuery(
    getRepliesWithUserRepo(parentId, page, limit),
  )

  if (error) {
    return { error: { message: error.message } }
  }

  return {
    error: null,
    data: result,
  }
}
