ALTER TABLE "places" RENAME COLUMN "state" TO "state_province";--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "best_season" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "amenities" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "postcode" integer;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "opening_hours" text[] DEFAULT '{}'::text[];