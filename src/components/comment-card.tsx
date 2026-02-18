import { motion } from "framer-motion"
import { Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react"
import type { PlaceComment } from "@/types/place"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CommentCardProps {
  comment: PlaceComment
  index?: number
  replyCount?: number
  currentUserId?: string
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, newComment: string) => void
  isDeleting?: boolean
  isEditing?: boolean
}

const CommentCard = ({
  comment,
  index = 0,
  replyCount = 0,
  currentUserId,
  onDelete,
  onEdit,
  isDeleting = false,
  isEditing = false,
}: CommentCardProps) => {
  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  const isOwner = currentUserId === comment.userId
  const canEdit = comment.isEditable && isOwner

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(comment.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(comment.id, comment.comment)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="hover:bg-secondary cursor-pointer rounded-lg p-2"
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
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-foreground font-semibold">
                {comment.userName}
              </h4>
              <p className="text-muted-foreground text-sm">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-1">
              {canEdit && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isEditing}
                  className="text-muted-foreground hover:text-foreground h-8"
                >
                  {isEditing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="mr-1 h-4 w-4" />
                  )}
                  Edit
                </Button>
              )}
              {isOwner && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive h-8"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </div>
          <p className="text-foreground leading-relaxed">{comment.comment}</p>

          {/* View Replies Button */}
          {replyCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              View {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CommentCard
