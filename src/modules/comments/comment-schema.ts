import { z } from "zod"

const MAX_COMMENT_LENGTH = 140

export const addCommentSchema = z.object({
  placeId: z.string(),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(
      MAX_COMMENT_LENGTH,
      `Comment must be ${MAX_COMMENT_LENGTH} characters or less`,
    ),
})

export const addReplySchema = z.object({
  placeId: z.string(),
  comment: z
    .string()
    .min(1, "Reply is required")
    .max(
      MAX_COMMENT_LENGTH,
      `Reply must be ${MAX_COMMENT_LENGTH} characters or less`,
    ),
  parentId: z.string(),
})

export const getCommentsSchema = z.object({
  placeId: z.string(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export const getRepliesSchema = z.object({
  commentId: z.string(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(5),
})

export const deleteCommentSchema = z.object({
  commentId: z.string(),
})

export const updateCommentSchema = z.object({
  commentId: z.string(),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(
      MAX_COMMENT_LENGTH,
      `Comment must be ${MAX_COMMENT_LENGTH} characters or less`,
    ),
})

export type AddCommentInput = z.infer<typeof addCommentSchema>
export type AddReplyInput = z.infer<typeof addReplySchema>
export type GetCommentsInput = z.infer<typeof getCommentsSchema>
export type GetRepliesInput = z.infer<typeof getRepliesSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
