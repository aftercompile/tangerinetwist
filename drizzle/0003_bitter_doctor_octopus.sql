CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'cod');--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'netbanking';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'wallet';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpay_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpay_payment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpay_signature" text;