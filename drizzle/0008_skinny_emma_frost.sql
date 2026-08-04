ALTER TABLE "orders" ADD COLUMN "fastrr_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_source" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "external_id" bigserial NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_fastrr_order_id_unique" UNIQUE("fastrr_order_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_external_id_unique" UNIQUE("external_id");