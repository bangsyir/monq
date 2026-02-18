import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  addCommentSchema,
  addReplySchema,
  deleteCommentSchema,
  getCommentsSchema,
  getRepliesSchema,
  updateCommentSchema,
} from "./comment-schema"
import {
  createCommentService,
  createReplyService,
  deleteCommentService,
  getCommentByIdService,
  getCommentsService,
  getRepliesService,
  updateCommentService,
} from "./comment-service.server"
import { authMiddleware, optionalAuthMiddleware } from "@/lib/auth-middleware"

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
  .middleware([optionalAuthMiddleware])
  .inputValidator(getCommentsSchema)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id
    const result = await getCommentsService(
      data.placeId,
      data.page,
      data.limit,
      userId,
    )

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getReplies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getRepliesSchema)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id
    const result = await getRepliesService(
      data.commentId,
      data.page,
      data.limit,
      userId,
    )

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const getCommentById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ data: commentId, context }) => {
    const userId = context?.user?.id
    const result = await getCommentByIdService(commentId, userId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await deleteCommentService(data.commentId, userId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })

export const updateComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const result = await updateCommentService(
      data.commentId,
      userId,
      data.comment,
    )

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result.data
  })
