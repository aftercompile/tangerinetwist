CREATE TYPE "public"."sales_channel" AS ENUM('direct', 'amazon', 'flipkart', 'meesho');--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"gst_state" text,
	"gst_rate_percent" numeric(5, 2),
	"default_hsn_code" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "channel" "sales_channel" DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "external_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_channel_external_order_id_unique" UNIQUE("channel","external_order_id");--> statement-breakpoint
INSERT INTO "store_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;