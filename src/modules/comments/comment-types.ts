export interface CommentUser {
  id: string
  name: string
  image: string | null
}

export interface Comment {
  id: string
  placeId: string
  userId: string
  parentId: string | null
  comment: string
  createdAt: Date
  updatedAt: Date
  user: CommentUser
  replyCount?: number
}

export interface Reply {
  id: string
  placeId: string
  userId: string
  parentId: string | null
  comment: string
  createdAt: Date
  updatedAt: Date
  user: CommentUser
}

export interface PaginatedComments {
  comments: Array<Comment>
  hasMore: boolean
  totalCount: number
}

export interface PaginatedReplies {
  replies: Array<Reply>
  hasMore: boolean
  totalCount: number
}

export interface AddCommentData {
  placeId: string
  userId: string
  comment: string
}

export interface AddReplyData {
  placeId: string
  userId: string
  parentId: string
  comment: string
}
