import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  addCommentSchema,
  addReplySchema,
  getCommentsSchema,
  getRepliesSchema,
} from "./comment-schema"
import {
  createCommentService,
  createReplyService,
  getCommentByIdService,
  getCommentsService,
  getRepliesService,
} from "./comment-service.server"
import { authMiddleware } from "@/lib/auth-middleware"

export const addComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await createCommentService({
      placeId: data.placeId,
      userId,
      comment: data.comment,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const addReply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(addReplySchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await createReplyService({
      placeId: data.placeId,
      userId,
      parentId: data.parentId,
      comment: data.comment,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getComments = createServerFn({ method: "GET" })
  .inputValidator(getCommentsSchema)
  .handler(async ({ data }) => {
    const result = await getCommentsService(data.placeId, data.page, data.limit)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getReplies = createServerFn({ method: "GET" })
  .inputValidator(getRepliesSchema)
  .handler(async ({ data }) => {
    const result = await getRepliesService(
      data.commentId,
      data.page,
      data.limit,
    )

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getCommentById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data: commentId }) => {
    const result = await getCommentByIdService(commentId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })
