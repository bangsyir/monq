ALTER TABLE "place_categories" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "place_categories" ADD CONSTRAINT "place_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_category_id_idx" ON "place_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "place_category_unique_idx" ON "place_categories" USING btree ("place_id","category_id");--> statement-breakpoint
ALTER TABLE "place_categories" DROP COLUMN "category";