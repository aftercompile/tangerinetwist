ALTER TABLE "categories" ADD COLUMN "external_id" bigserial NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_external_id_unique" UNIQUE("external_id");