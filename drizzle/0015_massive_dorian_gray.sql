ALTER TABLE "order_items" ADD COLUMN "customization" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "builder_config" jsonb;