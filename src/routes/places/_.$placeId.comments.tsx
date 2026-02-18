import { useServerFn } from "@tanstack/react-start"
import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, MapPin, Star } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { AddComment } from "./-components/add-comments"
import type { PlaceComment } from "@/types/place"
import type { Comment } from "@/modules/comments"
import { getPlaceByIdNoAuth } from "@/modules/places"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CommentCard from "@/components/comment-card"
import { deleteComment, getComments, updateComment } from "@/modules/comments"

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

export const Route = createFileRoute("/places/_/$placeId/comments")({
  component: RouteComponent,
  beforeLoad: ({ context, params: { placeId } }) => {
    if (!context.user) {
      toast.error("Please login first")
      throw redirect({ to: "/places/$placeId", params: { placeId } })
    }
  },
  loader: async ({ params: { placeId } }) => {
    const place = await getPlaceByIdNoAuth({ data: placeId })
    return { place }
  },
})

function RouteComponent() {
  const { place } = Route.useLoaderData()
  // const [comments, setComments] = useState<Array<Place>>()
  // const [commentPage, setCommentPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [commentToEdit, setCommentToEdit] = useState<{
    id: string
    text: string
  } | null>(null)
  const [editText, setEditText] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const getCommentsFn = useServerFn(getComments)
  const deleteCommentFn = useServerFn(deleteComment)
  const updateCommentFn = useServerFn(updateComment)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: session } = await authClient.getSession()
      if (session?.user) {
        setCurrentUserId(session.user.id)
      }
    }
    fetchSession()
  }, [])

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId)
  }

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return
    setIsDeleting(commentToDelete)
    setDeleteError(null)
    try {
      await deleteCommentFn({ data: { commentId: commentToDelete } })
      // setComments((prev) => prev.filter((c) => c.id !== commentToDelete))
      setCommentToDelete(null)
    } catch (error) {
      console.error("Failed to delete comment:", error)
      setDeleteError("Failed to delete comment. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCancelDelete = () => {
    setCommentToDelete(null)
  }

  const handleEditClick = (commentId: string, currentText: string) => {
    setCommentToEdit({ id: commentId, text: currentText })
    setEditText(currentText)
  }

  const handleConfirmEdit = async () => {
    if (!commentToEdit || !editText.trim()) return
    setIsUpdating(commentToEdit.id)
    setUpdateError(null)
    try {
      await updateCommentFn({
        data: { commentId: commentToEdit.id, comment: editText.trim() },
      })
      setCommentToEdit(null)
      setEditText("")
    } catch (error) {
      console.error("Failed to update comment:", error)
      setUpdateError("Failed to update comment. Please try again.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCancelEdit = () => {
    setCommentToEdit(null)
    setEditText("")
    setUpdateError(null)
  }

  const {
    data,
    isLoading: isLoadingComments,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["place-comments", place?.id],
    queryFn: async ({ pageParam }) => {
      const result = await getCommentsFn({
        data: {
          placeId: place?.id || "",
          page: pageParam,
          limit: 10,
        },
      })
      return result
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage.nextPage : undefined
    },
  })

  if (!place) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            Place not found
          </h1>
          <Link to="/places" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to places
          </Link>
        </div>
      </div>
    )
  }

  const placeImage = place.images?.[0]?.url

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-3xl px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/places/$placeId"
            params={{ placeId: place.id }}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to place
          </Link>
        </div>

        {/* Place Header - Card Style */}
        <div className="bg-card mb-6 overflow-hidden rounded-xl border">
          <Link
            to="/places/$placeId"
            params={{ placeId: place.id }}
            className="hover:bg-accent/50 flex items-center gap-4 p-4 transition-colors"
          >
            {placeImage && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={placeImage}
                  alt={place.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-foreground truncate text-lg font-semibold">
                {place.name}
              </h2>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Star className="fill-accent text-accent h-4 w-4" />
                <span className="text-foreground font-medium">
                  {place.rating}
                </span>
                <span>({place.reviewCount} reviews)</span>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {place.streetAddress}, {place.city}, {place.stateProvince}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Error Alert Dialog */}
        <AlertDialog
          open={!!deleteError}
          onOpenChange={() => setDeleteError(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{deleteError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setDeleteError(null)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Alert Dialog */}
        <AlertDialog
          open={!!updateError}
          onOpenChange={() => setUpdateError(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{updateError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setUpdateError(null)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                disabled={!editText.trim() || isUpdating !== null}
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="mb-4">
          <AddComment isLoggedIn={true} placeId={place.id} />
        </div>
        {/* Comments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            {data?.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group?.comments.length === 0 && isLoadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {group?.comments.map((comment, index) => (
                      <div key={comment.id}>
                        <Link
                          to="/comments/$commentId"
                          params={{ commentId: comment.id }}
                          className="block"
                        >
                          <CommentCard
                            comment={formatComment(comment)}
                            index={index}
                            replyCount={comment.replyCount || 0}
                            currentUserId={currentUserId}
                            onDelete={handleDeleteClick}
                            onEdit={handleEditClick}
                            isDeleting={isDeleting === comment.id}
                            isEditing={isUpdating === comment.id}
                          />
                        </Link>
                        <Separator />
                      </div>
                    ))}

                    {group?.comments.length === 0 && (
                      <p className="text-muted-foreground py-8 text-center">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                // onClick={handleLoadMoreComments}
                disabled={isLoadingComments || !hasNextPage}
              >
                {isLoadingComments && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Load more comments
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
