ALTER TABLE "categories" ADD COLUMN "hero_statement" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "story_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "story_body" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "story_image" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "journey_steps" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "stats" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "lifestyle_image" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "lifestyle_headline" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "lifestyle_body" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "closing_image" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "closing_headline" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "closing_body" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "style_tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "color_tag" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size_tier" text;