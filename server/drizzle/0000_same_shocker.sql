CREATE TYPE "public"."property_status" AS ENUM('draft', 'published', 'sold', 'archived');--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"address" text NOT NULL,
	"price" bigint NOT NULL,
	"price_per_m2" bigint,
	"area" numeric(12, 2) NOT NULL,
	"rooms" integer DEFAULT 0 NOT NULL,
	"floor" integer NOT NULL,
	"floors_total" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"about" text DEFAULT '' NOT NULL,
	"condition" text DEFAULT 'Свободная продажа' NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"specialist_name" text,
	"specialist_role" text,
	"specialist_phone" text,
	"specialist_whatsapp" text,
	"specialist_photo" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "properties_sort_idx" ON "properties" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "property_images_property_idx" ON "property_images" USING btree ("property_id");