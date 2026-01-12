CREATE TABLE "place_categories" (
	"place_id" uuid NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "places" DROP CONSTRAINT "places_category_id_categories_id_fk";
--> statement-breakpoint
DROP INDEX "category_idx";--> statement-breakpoint
ALTER TABLE "place_categories" ADD CONSTRAINT "place_categories_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_place_id_idx" ON "place_categories" USING btree ("place_id");--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "category_id";