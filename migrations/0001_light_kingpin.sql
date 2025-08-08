CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending');--> statement-breakpoint
CREATE TYPE "public"."recurrence_type" AS ENUM('undetermined', 'paused', 'determined');--> statement-breakpoint
CREATE TABLE "recurring_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount" real NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"expense_type" "expense_type" NOT NULL,
	"routine_category" "routine_category",
	"occasional_group_id" integer,
	"fixed_expense_type_id" integer,
	"frequency" "frequency_type",
	"supermarket_id" integer,
	"restaurant_id" integer,
	"occasion_type" "occasion_type",
	"special_occasion_description" text,
	"food_purchase_type" "purchase_type",
	"service_type_id" integer,
	"service_description" text,
	"study_type_id" integer,
	"study_description" text,
	"leisure_type_id" integer,
	"leisure_description" text,
	"personal_care_type_id" integer,
	"personal_care_description" text,
	"shop_id" integer,
	"shopping_purchase_type" "purchase_type",
	"shopping_occasion_type" "occasion_type",
	"shopping_special_occasion_description" text,
	"start_place_id" integer,
	"end_place_id" integer,
	"starting_point" text,
	"destination" text,
	"transport_mode" "transport_mode",
	"transport_description" text,
	"health_type_id" integer,
	"health_description" text,
	"family_member_id" integer,
	"family_description" text,
	"charity_type_id" integer,
	"charity_description" text,
	"recurrence_type" "recurrence_type" DEFAULT 'undetermined' NOT NULL,
	"installments_total" integer,
	"installments_paid" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp NOT NULL,
	"next_occurrence_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "recurring_expense_id" integer;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "occasional_groups" ADD COLUMN "opening_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "occasional_groups" ADD COLUMN "closing_date" timestamp;--> statement-breakpoint
ALTER TABLE "public"."expenses" ALTER COLUMN "transport_mode" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."recurring_expenses" ALTER COLUMN "transport_mode" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transport_mode";--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('car', 'uber', 'bus', 'plane', 'subway', 'another');--> statement-breakpoint
ALTER TABLE "public"."expenses" ALTER COLUMN "transport_mode" SET DATA TYPE "public"."transport_mode" USING "transport_mode"::"public"."transport_mode";--> statement-breakpoint
ALTER TABLE "public"."recurring_expenses" ALTER COLUMN "transport_mode" SET DATA TYPE "public"."transport_mode" USING "transport_mode"::"public"."transport_mode";