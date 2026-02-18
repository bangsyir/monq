import { Loader2 } from "lucide-react"
import React from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment } from "@/modules/comments"

export function AddComment({
  isLoggedIn,
  placeId,
}: {
  isLoggedIn: boolean
  placeId: string
}) {
  const [newComment, setNewComment] = React.useState("")
  const addCommentFn = useServerFn(addComment)
  const queryClient = useQueryClient()
  // Use React Query mutation to add comments
  const { mutate: handleAddComment, isPending: isAddingComment } = useMutation({
    mutationFn: async () => {
      if (!newComment.trim() || !isLoggedIn) return
      await addCommentFn({
        data: {
          placeId: placeId,
          comment: newComment,
        },
      })
    },
    onSuccess: () => {
      setNewComment("")
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["comments", placeId] })
      queryClient.invalidateQueries({ queryKey: ["place-comments", placeId] })
    },
    onError: (error) => {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment. Please try again.")
    },
  })
  return (
    <>
      <div className="relative">
        <Textarea
          placeholder="Share your thoughts..."
          className="bg-background mb-2"
          value={newComment}
          onChange={(e) => {
            const value = e.target.value
            if (value.length <= 140) {
              setNewComment(value)
            }
          }}
          maxLength={140}
        />
        <div className="text-muted-foreground text-right text-xs">
          {newComment.length}/140
        </div>
      </div>
      <Button
        onClick={() => handleAddComment()}
        disabled={isAddingComment || !newComment.trim()}
      >
        {isAddingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Post Comment
      </Button>
    </>
  )
}
