ALTER TABLE "customer_addresses" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shiprocket_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shiprocket_shipment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "awb_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shiprocket_status" text;