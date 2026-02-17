import { z } from "zod"

export const addCommentSchema = z.object({
  placeId: z.string(),
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(2000, "Comment is too long"),
})

export const addReplySchema = z.object({
  placeId: z.string(),
  comment: z
    .string()
    .min(1, "Reply is required")
    .max(2000, "Reply is too long"),
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

export type AddCommentInput = z.infer<typeof addCommentSchema>
export type AddReplyInput = z.infer<typeof addReplySchema>
export type GetCommentsInput = z.infer<typeof getCommentsSchema>
export type GetRepliesInput = z.infer<typeof getRepliesSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
