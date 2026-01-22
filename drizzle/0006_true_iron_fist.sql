DROP TABLE "amenities" CASCADE;--> statement-breakpoint
DROP TABLE "place_amenities" CASCADE;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "amenities" text[];