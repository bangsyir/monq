ALTER TABLE "places" ADD COLUMN "rating_sum" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "rating_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "avg_rating" numeric(10, 2) DEFAULT 0;--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "review_count";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "comment";