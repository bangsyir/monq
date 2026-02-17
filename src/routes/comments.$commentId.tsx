import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import type { Comment, Reply } from "@/modules/comments"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  addReply,
  deleteComment,
  getCommentById,
  getReplies,
} from "@/modules/comments"
import { Separator } from "@/components/ui/separator"
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
import { authClient } from "@/lib/auth-client"

interface CommentWithPlace extends Comment {
  place: {
    id: string
    name: string
    rating: number
    reviewCount: number
    streetAddress: string
    city: string
    stateProvince: string
    country: string
    images: Array<{ id: string; url: string }>
  }
}

export const Route = createFileRoute("/comments/$commentId")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/places" })
    }
  },
  loader: async ({ params: { commentId }, context }) => {
    const isLoggedIn = context.user !== null
    const comment = await getCommentById({ data: commentId })
    return { comment, isLoggedIn }
  },
})

function RouteComponent() {
  const { comment, isLoggedIn } = Route.useLoaderData()
  const { commentId } = useParams({ from: "/comments/$commentId" })
  const navigate = useNavigate()
  const [replies, setReplies] = useState<Array<Reply>>([])
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [hasMoreReplies, setHasMoreReplies] = useState(false)
  const [repliesPage, setRepliesPage] = useState(1)
  const [replyText, setReplyText] = useState("")
  const [isAddingReply, setIsAddingReply] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<{
    id: string
    isMainComment: boolean
  } | null>(null)

  const getRepliesFn = useServerFn(getReplies)
  const addReplyFn = useServerFn(addReply)
  const deleteCommentFn = useServerFn(deleteComment)

  const commentWithPlace = comment as CommentWithPlace | null

  useEffect(() => {
    const fetchSession = async () => {
      const { data: session } = await authClient.getSession()
      if (session?.user) {
        setCurrentUserId(session.user.id)
      }
    }
    fetchSession()
  }, [])

  const handleDeleteClick = (
    targetCommentId: string,
    isMainComment: boolean = false,
  ) => {
    setCommentToDelete({ id: targetCommentId, isMainComment })
  }

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return
    setIsDeleting(commentToDelete.id)
    setDeleteError(null)
    try {
      await deleteCommentFn({ data: { commentId: commentToDelete.id } })
      if (commentToDelete.isMainComment) {
        // Redirect to place comments page if main comment is deleted
        if (commentWithPlace) {
          navigate({
            to: "/places/$placeId/comments",
            params: { placeId: commentWithPlace.placeId },
          })
        }
      } else {
        // Remove reply from list
        setReplies((prev) => prev.filter((r) => r.id !== commentToDelete.id))
      }
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

  useEffect(() => {
    if (commentId) {
      loadReplies(1)
    }
  }, [commentId])

  const loadReplies = async (page: number) => {
    setIsLoadingReplies(true)
    try {
      const result = await getRepliesFn({
        data: {
          commentId,
          page,
          limit: 10,
        },
      })

      if (result) {
        if (page === 1) {
          setReplies(result.replies)
        } else {
          setReplies((prev) => [...prev, ...result.replies])
        }
        setHasMoreReplies(result.hasMore)
      }
    } catch (error) {
      console.error("Failed to load replies:", error)
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const handleLoadMoreReplies = async () => {
    const nextPage = repliesPage + 1
    await loadReplies(nextPage)
    setRepliesPage(nextPage)
  }

  const handleAddReply = async () => {
    if (!replyText.trim() || !isLoggedIn || !commentWithPlace) return

    setIsAddingReply(true)
    try {
      await addReplyFn({
        data: {
          placeId: commentWithPlace.placeId,
          parentId: commentId,
          comment: replyText,
        },
      })
      setReplyText("")
      setShowReplyInput(false)
      // Reload replies to show the new one
      await loadReplies(1)
      setRepliesPage(1)
    } catch (error) {
      console.error("Failed to add reply:", error)
    } finally {
      setIsAddingReply(false)
    }
  }

  const handleCancelReply = () => {
    setShowReplyInput(false)
    setReplyText("")
  }

  const formattedCommentDate = commentWithPlace
    ? new Date(commentWithPlace.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  if (!commentWithPlace) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            Comment not found
          </h1>
          <Link to="/places" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to places
          </Link>
        </div>
      </div>
    )
  }

  const place = commentWithPlace.place
  const placeImage = place.images?.[0]?.url

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-3xl px-4 py-6">
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
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/places/$placeId/comments"
            params={{ placeId: place.id }}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to place
          </Link>
        </motion.div>

        {/* Place Mini View - Card Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card mb-6 overflow-hidden rounded-xl border"
        >
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
        </motion.div>

        {/* Main Comment - Background Color Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={commentWithPlace.user.image || ""}
                alt={commentWithPlace.user.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {commentWithPlace.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-semibold">
                    {commentWithPlace.user.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {formattedCommentDate}
                  </p>
                </div>
                {currentUserId === commentWithPlace.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(commentWithPlace.id, true)}
                    disabled={isDeleting === commentWithPlace.id}
                    className="text-muted-foreground hover:text-destructive h-8"
                  >
                    {isDeleting === commentWithPlace.id ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {commentWithPlace.comment}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                View {replies.length}{" "}
                {replies.length === 1 ? "Reply" : "Replies"}
              </Button>

              {showReplyInput &&
                (!isLoggedIn ? (
                  <span className="flex items-center gap-3">
                    <span className="text-sm">Please login first</span>
                  </span>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px]"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelReply}
                        disabled={isAddingReply}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddReply}
                        disabled={isAddingReply || !replyText.trim()}
                      >
                        {isAddingReply && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Post
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Replies Section - Background Color Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4 pl-12"
        >
          <div className="space-y-3">
            {isLoadingReplies && replies.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {replies.map((reply, index) => (
                  <div key={reply.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={reply.user.image || ""}
                            alt={reply.user.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {reply.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <div>
                              <span className="text-foreground text-sm font-medium">
                                {reply.user.name}
                              </span>
                              <span className="text-muted-foreground ml-2 text-sm">
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            {currentUserId === reply.userId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteClick(reply.id, false)
                                }
                                disabled={isDeleting === reply.id}
                                className="text-muted-foreground hover:text-destructive h-6 px-2"
                              >
                                {isDeleting === reply.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <p className="text-foreground text-sm leading-relaxed">
                            {reply.comment}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    <Separator />
                  </div>
                ))}

                {replies.length === 0 && (
                  <p className="text-muted-foreground py-8 text-center">
                    No replies yet.
                  </p>
                )}

                {hasMoreReplies && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMoreReplies}
                      disabled={isLoadingReplies}
                    >
                      {isLoadingReplies && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Load more replies
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
