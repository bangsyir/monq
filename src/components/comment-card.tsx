import { motion } from "framer-motion"
import { ChevronDown, Loader2, Reply } from "lucide-react"
import { useState } from "react"
import type { PlaceComment } from "@/types/place"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentCardProps {
  comment: PlaceComment
  index?: number
  onReply: (commentId: string, replyText: string) => void
  onLoadReplies?: (commentId: string) => void
  isLoggedIn?: boolean
  replyCount?: number
  isLoadingReplies?: boolean
}

const CommentCard = ({
  comment,
  index = 0,
  onReply,
  onLoadReplies,
  isLoggedIn = false,
  replyCount = 0,
  isLoadingReplies = false,
}: CommentCardProps) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplies, setShowReplies] = useState(false)

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText)
      setReplyText("")
      setIsReplying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-border bg-card rounded-xl border p-6"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={comment.userAvatar} alt={comment.userName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {comment.userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h4 className="text-foreground font-semibold">
                {comment.userName}
              </h4>
              <p className="text-muted-foreground text-sm">{formattedDate}</p>
            </div>
          </div>
          <p className="text-foreground mb-3 leading-relaxed">
            {comment.comment}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isLoggedIn) {
                  setIsReplying(!isReplying)
                } else {
                  // Future: Open login dialog
                  alert("Please log in to reply to comments")
                }
              }}
              className="text-muted-foreground hover:text-foreground h-8"
              disabled={!isLoggedIn}
            >
              <Reply className="mr-1 h-4 w-4" />
              Reply
            </Button>

            {/* Show/Hide Replies Button */}
            {(comment.replies && comment.replies.length > 0) ||
            replyCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newShowReplies = !showReplies
                  setShowReplies(newShowReplies)
                  if (
                    newShowReplies &&
                    onLoadReplies &&
                    (!comment.replies || comment.replies.length === 0)
                  ) {
                    onLoadReplies(comment.id)
                  }
                }}
                disabled={isLoadingReplies}
                className="text-muted-foreground hover:text-foreground h-8"
              >
                {isLoadingReplies ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown
                    className={`mr-1 h-4 w-4 transition-transform ${showReplies ? "rotate-180" : ""}`}
                  />
                )}
                {showReplies ? "Hide" : "Show"}{" "}
                {replyCount > 0 ? replyCount : comment.replies?.length || 0}{" "}
                {(replyCount > 0
                  ? replyCount
                  : comment.replies?.length || 0) === 1
                  ? "Reply"
                  : "Replies"}
              </Button>
            ) : null}
          </div>

          {isReplying && isLoggedIn && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="bg-secondary"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyText("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="bg-muted mt-4 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                Please{" "}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                >
                  log in
                </button>{" "}
                to reply to this comment.
              </p>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && showReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="border-border mt-6 space-y-4 border-l-2 pl-8"
            >
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {reply.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="text-foreground text-sm font-medium">
                        {reply.userName}
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">
                      {reply.comment}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CommentCard
