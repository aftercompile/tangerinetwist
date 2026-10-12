CREATE TABLE "magic_checkout_sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"razorpay_order_id" text,
	"customer_id" uuid,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_checkout_sessions_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
ALTER TABLE "magic_checkout_sessions" ADD CONSTRAINT "magic_checkout_sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_checkout_sessions" ADD CONSTRAINT "magic_checkout_sessions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;