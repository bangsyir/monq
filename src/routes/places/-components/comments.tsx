import { Link, getRouteApi } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Loader2, Star } from "lucide-react"
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { PlaceComment } from "@/types/place"
import type { Comment } from "@/modules/comments"
import CommentCard from "@/components/comment-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { addComment, getComments } from "@/modules/comments"
import LoginDialog from "@/components/login-dialog"

const COMMENTS_LIMIT = 3

function formatComment(comment: Comment): PlaceComment {
  return {
    id: comment.id,
    userId: comment.userId,
    userName: comment.user.name,
    userAvatar: comment.user.image || "",
    comment: comment.comment,
    createdAt: comment.createdAt.toISOString(),
    replies: [],
    replyCount: comment.replyCount,
  }
}

const routeApi = getRouteApi("/places/$placeId")

export function CommentsComponent() {
  const { place, isLoggedIn } = routeApi.useLoaderData()
  if (!place) {
    return <div>Comment not found</div>
  }
  const [newComment, setNewComment] = useState("")
  const queryClient = useQueryClient()
  const addCommentFn = useServerFn(addComment)
  const getCommentsFn = useServerFn(getComments)
  // Use React Query to fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", place?.id],
    queryFn: async () => {
      const result = await getCommentsFn({
        data: {
          placeId: place.id,
          page: 1,
          limit: COMMENTS_LIMIT,
        },
      })
      return result?.comments.map(formatComment) ?? []
    },
  })

  // Use React Query mutation to add comments
  const { mutate: handleAddComment, isPending: isAddingComment } = useMutation({
    mutationFn: async () => {
      if (!newComment.trim() || !isLoggedIn) return
      await addCommentFn({
        data: {
          placeId: place.id,
          comment: newComment,
        },
      })
    },
    onSuccess: () => {
      setNewComment("")
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["comments", place?.id] })
    },
    onError: (error) => {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment. Please try again.")
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-semibold">
          Comments ({comments.length})
        </h2>
        <div className="flex items-center gap-2">
          <Star className="fill-accent text-accent h-5 w-5" />
          <span className="text-foreground font-semibold">{place.rating}</span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="bg-secondary mb-6 rounded-xl p-6">
        <h3 className="text-foreground mb-4 font-semibold">Leave a comment</h3>
        {isLoggedIn ? (
          <>
            <Textarea
              placeholder="Share your thoughts..."
              className="bg-background mb-4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              onClick={() => handleAddComment()}
              disabled={isAddingComment}
            >
              {isAddingComment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Post Comment
            </Button>
          </>
        ) : (
          <div className="bg-muted flex flex-col items-center rounded-lg text-center">
            <p className="text-muted-foreground mb-3">
              Please log in to post a comment.
            </p>
            <div>
              <LoginDialog />
            </div>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {isLoadingComments && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {comments.map((comment) => {
              return (
                <div key={comment.id}>
                  <Link
                    to="/comments/$commentId"
                    params={{ commentId: comment.id }}
                    className="block"
                    onClick={() => {
                      !isLoggedIn && toast.error("Please login first")
                    }}
                    disabled={!isLoggedIn}
                  >
                    <CommentCard
                      comment={comment}
                      replyCount={comment.replyCount || 0}
                    />
                  </Link>
                  <Separator />
                </div>
              )
            })}
            {comments.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
            {/* View All Comments Link */}
            <div className="flex justify-center pt-4">
              <Link
                to="/places/$placeId/comments"
                params={{ placeId: place.id }}
                className={buttonVariants({ variant: "outline" })}
              >
                View all comments
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
