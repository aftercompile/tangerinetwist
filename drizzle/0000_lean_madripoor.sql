CREATE TYPE "public"."image_tone" AS ENUM('warm', 'cool', 'charcoal', 'beige');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('card', 'upi', 'cod');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in-stock', 'made-to-order', 'low-stock');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"hero_icon" text NOT NULL,
	"material" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"price" integer NOT NULL,
	"material" text NOT NULL,
	"image_src" text,
	"image_icon" text NOT NULL,
	"image_tone" "image_tone" DEFAULT 'beige' NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"pin" text NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"subtotal" integer NOT NULL,
	"shipping" integer NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"src" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"tone" "image_tone" DEFAULT 'beige' NOT NULL,
	"icon" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"related_product_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"author" text NOT NULL,
	"location" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"story" text NOT NULL,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"material" text NOT NULL,
	"materials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dimensions" text NOT NULL,
	"weight" text NOT NULL,
	"colorway" text NOT NULL,
	"finish_time" text NOT NULL,
	"icon" text NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"badges" text[] DEFAULT '{}' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"care_instructions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"shipping_info" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"return_policy" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stock" "stock_status" DEFAULT 'in-stock' NOT NULL,
	"is_personalized" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;