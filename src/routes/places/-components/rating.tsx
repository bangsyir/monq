import { Star } from "lucide-react"
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { addRating, getUserRating } from "@/modules/rating"
import LoginDialog from "@/components/login-dialog"

interface RatingComponentProps {
  placeId: string
  isLoggedIn: boolean
  currentUserId?: string
  initialRating?: number
}

export function RatingComponent({
  placeId,
  isLoggedIn,
  currentUserId,
}: RatingComponentProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const queryClient = useQueryClient()
  const getUserRatingFn = useServerFn(getUserRating)
  const addRatingFn = useServerFn(addRating)

  const { data: userRating, isLoading: isLoadingUserRating } = useQuery({
    queryKey: ["user-rating", placeId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null
      return getUserRatingFn({ data: { placeId } })
    },
    enabled: !!currentUserId && isLoggedIn,
  })

  const { mutate: submitRating, isPending: isSubmitting } = useMutation({
    mutationFn: async (rating: number) => {
      await addRatingFn({ data: { placeId, rating } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rating", placeId] })
      toast.success("Rating submitted successfully!")
    },
    onError: (error) => {
      console.error("Failed to submit rating:", error)
      toast.error("Failed to submit rating. Please try again.")
    },
  })

  if (!isLoggedIn) {
    return (
      <div className="border-border bg-card shadow-card rounded-xl border p-4">
        <h3 className="text-foreground mb-3 font-semibold">Rate this place</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="text-muted-foreground h-6 w-6 cursor-not-allowed"
              />
            ))}
          </div>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Log in to rate this place
        </p>
        <div className="mt-3">
          <LoginDialog />
        </div>
      </div>
    )
  }

  if (isLoadingUserRating) {
    return (
      <div className="border-border bg-card shadow-card rounded-xl border p-4">
        <h3 className="text-foreground mb-3 font-semibold">Rate this place</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="text-muted-foreground h-6 w-6 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (userRating) {
    return (
      <div className="border-border bg-card shadow-card rounded-xl border p-4">
        <h3 className="text-foreground mb-3 font-semibold">Your Rating</h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= userRating.rating
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-foreground font-medium">
            {userRating.rating}/5
          </span>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          Thank you for rating this place!
        </p>
      </div>
    )
  }

  return (
    <div className="border-border bg-card shadow-card rounded-xl border p-4">
      <h3 className="text-foreground mb-3 font-semibold">Rate this place</h3>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onClick={() => submitRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none disabled:opacity-50"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoveredRating || 0)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground hover:text-accent"
                }`}
              />
            </button>
          ))}
        </div>
        {isSubmitting && (
          <span className="text-muted-foreground text-sm">Submitting...</span>
        )}
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        Click on a star to rate this place
      </p>
    </div>
  )
}
