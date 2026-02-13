import { Link, createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, MapPin, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import type { Comment } from "@/modules/comments"
import type { PlaceComment } from "@/types/place"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CommentCard from "@/components/comment-card"
import { getPlaceByIdNoAuth } from "@/modules/places"
import { getComments } from "@/modules/comments"

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

export const Route = createFileRoute("/places_/$placeId/comments")({
  component: RouteComponent,
  loader: async ({ params: { placeId } }) => {
    const place = await getPlaceByIdNoAuth({ data: placeId })
    return { place }
  },
})

function RouteComponent() {
  const { place } = Route.useLoaderData()
  const [comments, setComments] = useState<
    Array<PlaceComment & { replyCount?: number }>
  >([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [commentPage, setCommentPage] = useState(1)

  const getCommentsFn = useServerFn(getComments)

  const loadComments = async (page: number) => {
    if (!place) return
    setIsLoadingComments(true)
    try {
      const result = await getCommentsFn({
        data: {
          placeId: place.id,
          page,
          limit: 10,
        },
      })

      if (result) {
        const formattedComments = result.comments.map(formatComment)
        if (page === 1) {
          setComments(formattedComments)
        } else {
          setComments((prev) => [...prev, ...formattedComments])
        }
        setHasMoreComments(result.hasMore)
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleLoadMoreComments = async () => {
    const nextPage = commentPage + 1
    await loadComments(nextPage)
    setCommentPage(nextPage)
  }

  useEffect(() => {
    if (place) {
      loadComments(1)
    }
  }, [place?.id])

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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/places/$placeId"
            params={{ placeId: place.id }}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to place
          </Link>
        </motion.div>

        {/* Place Header - Card Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card mb-8 overflow-hidden rounded-xl border"
        >
          <Link
            to="/places/$placeId"
            params={{ placeId: place.id }}
            className="hover:bg-accent/50 flex items-center gap-4 p-4 transition-colors"
          >
            {placeImage && (
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={placeImage}
                  alt={place.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-foreground truncate text-xl font-semibold">
                {place.name}
              </h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {place.streetAddress}, {place.city}, {place.stateProvince}
                </span>
              </div>
              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
                <Star className="fill-accent text-accent h-4 w-4" />
                <span className="text-foreground font-medium">
                  {place.rating}
                </span>
                <span>({place.reviewCount} reviews)</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Comments Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-foreground text-xl font-semibold">
            All Comments ({place.reviewCount})
          </h2>
        </motion.div>

        {/* Comments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {comments.map((comment, index) => (
                  <div key={comment.id}>
                    <Link
                      to="/comments/$commentId"
                      params={{ commentId: comment.id }}
                      className="block"
                    >
                      <CommentCard
                        comment={comment}
                        index={index}
                        replyCount={comment.replyCount || 0}
                      />
                    </Link>
                    <Separator />
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-muted-foreground py-8 text-center">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}

                {hasMoreComments && comments.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMoreComments}
                      disabled={isLoadingComments}
                    >
                      {isLoadingComments && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Load more comments
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
