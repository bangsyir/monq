import { Link, getRouteApi } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Loader2, Lock, Star } from "lucide-react"
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AddComment } from "./add-comments"
import type { PlaceComment } from "@/types/place"
import type { Comment } from "@/modules/comments"
import CommentCard from "@/components/comment-card"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteComment, getComments, updateComment } from "@/modules/comments"
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
    updatedAt: comment.updatedAt.toISOString(),
    replies: [],
    replyCount: comment.replyCount,
    isEditable: comment.isEditable,
  }
}

const routeApi = getRouteApi("/places/$placeId")

export function CommentsComponent() {
  const { place, isLoggedIn, currentUserId } = routeApi.useLoaderData()
  if (!place) {
    return <div>Comment not found</div>
  }
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [commentToEdit, setCommentToEdit] = useState<{
    id: string
    text: string
  } | null>(null)
  const [editText, setEditText] = useState("")
  const queryClient = useQueryClient()
  const getCommentsFn = useServerFn(getComments)
  const deleteCommentFn = useServerFn(deleteComment)
  const updateCommentFn = useServerFn(updateComment)

  // Use React Query to fetch comments
  const { data, isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", place?.id],
    queryFn: async () => {
      const result = await getCommentsFn({
        data: {
          placeId: place.id,
          page: 1,
          limit: COMMENTS_LIMIT,
        },
      })
      return result
    },
  })

  // Use React Query mutation to delete comments
  const { mutate: handleDeleteComment, isPending: isDeletingComment } =
    useMutation({
      mutationFn: async (commentId: string) => {
        await deleteCommentFn({ data: { commentId } })
      },
      onSuccess: () => {
        setCommentToDelete(null)
        // Invalidate and refetch comments
        queryClient.invalidateQueries({ queryKey: ["comments", place?.id] })
        queryClient.invalidateQueries({
          queryKey: ["place-comments", place?.id],
        })
        toast.success("Comment deleted successfully")
      },
      onError: (error) => {
        console.error("Failed to delete comment:", error)
        toast.error("Failed to delete comment. Please try again.")
      },
    })

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId)
  }

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      handleDeleteComment(commentToDelete)
    }
  }

  const handleCancelDelete = () => {
    setCommentToDelete(null)
  }

  // Use React Query mutation to update comments
  const { mutate: handleUpdateComment, isPending: isUpdatingComment } =
    useMutation({
      mutationFn: async ({
        commentId,
        comment,
      }: {
        commentId: string
        comment: string
      }) => {
        await updateCommentFn({ data: { commentId, comment } })
      },
      onSuccess: () => {
        setCommentToEdit(null)
        setEditText("")
        // Invalidate and refetch comments
        queryClient.invalidateQueries({ queryKey: ["comments", place?.id] })
        queryClient.invalidateQueries({
          queryKey: ["place-comments", place?.id],
        })
        toast.success("Comment updated successfully")
      },
      onError: (error) => {
        console.error("Failed to update comment:", error)
        toast.error("Failed to update comment. Please try again.")
      },
    })

  const handleEditClick = (commentId: string, currentText: string) => {
    setCommentToEdit({ id: commentId, text: currentText })
    setEditText(currentText)
  }

  const handleConfirmEdit = () => {
    if (commentToEdit && editText.trim()) {
      handleUpdateComment({
        commentId: commentToEdit.id,
        comment: editText.trim(),
      })
    }
  }

  const handleCancelEdit = () => {
    setCommentToEdit(null)
    setEditText("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-semibold">
          Comments ({data?.comments.length})
        </h2>
        <div className="flex items-center gap-2">
          <Star className="fill-accent text-accent h-5 w-5" />
          <span className="text-foreground font-semibold">{place.rating}</span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <h3 className="text-foreground mb-4 font-semibold">Leave a comment</h3>
        {isLoggedIn ? (
          <>
            <AddComment isLoggedIn={isLoggedIn} placeId={place.id} />
          </>
        ) : (
          <div className="flex flex-col items-center rounded-lg text-center">
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
        {isLoadingComments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {data?.comments.map((comment) => {
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
                      comment={formatComment(comment)}
                      replyCount={comment.replyCount || 0}
                      currentUserId={currentUserId}
                      onDelete={handleDeleteClick}
                      onEdit={handleEditClick}
                      isDeleting={
                        isDeletingComment && commentToDelete === comment.id
                      }
                      isEditing={
                        isUpdatingComment && commentToEdit?.id === comment.id
                      }
                    />
                  </Link>
                  <Separator />
                </div>
              )
            })}
            {data?.comments.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
            {/* View All Comments Link */}
            <div className="flex justify-center pt-4">
              <Link
                to="/places/$placeId/comments"
                params={{ placeId: place.id }}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    !isLoggedIn &&
                    "text-muted-foreground hover:text-muted-foreground",
                })}
                preload={false}
              >
                View all comments
                {!isLoggedIn && <Lock />}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <AlertDialog open={!!commentToEdit} onOpenChange={handleCancelEdit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Update your comment below. You can only edit comments within 10
              minutes of creation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Textarea
              value={editText}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 140) {
                  setEditText(value)
                }
              }}
              className="min-h-[100px]"
              placeholder="Edit your comment..."
              maxLength={140}
            />
            <div className="text-muted-foreground mt-1 text-right text-xs">
              {editText.length}/140
            </div>
          </div>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={handleCancelEdit}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              disabled={!editText.trim() || isUpdatingComment}
            >
              {isUpdatingComment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
