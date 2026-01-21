import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { PlaceReview } from "@/types/place";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCardProps {
  review: PlaceReview;
  index?: number;
}

const ReviewCard = ({ review, index = 0 }: ReviewCardProps) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={review.userAvatar} alt={review.userName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {review.userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">
                {review.userName}
              </h4>
              <p className="text-muted-foreground text-sm">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted"
                    }`}
                />
              ))}
            </div>
          </div>
          <p className="text-foreground leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
