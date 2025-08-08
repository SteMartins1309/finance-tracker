CREATE TYPE "public"."expense_type" AS ENUM('routine', 'occasional');--> statement-breakpoint
CREATE TYPE "public"."frequency_type" AS ENUM('weekly', 'monthly', 'semi-annually', 'annually');--> statement-breakpoint
CREATE TYPE "public"."occasion_type" AS ENUM('normal', 'special');--> statement-breakpoint
CREATE TYPE "public"."occasional_group_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix', 'debit-card', 'credit-card', 'cash', 'bank-transfer');--> statement-breakpoint
CREATE TYPE "public"."purchase_type" AS ENUM('in-person', 'online');--> statement-breakpoint
CREATE TYPE "public"."routine_category" AS ENUM('fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care', 'shopping', 'transportation', 'health', 'family', 'charity');--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('car', 'uber', 'public-transport', 'walking', 'bicycle');--> statement-breakpoint
CREATE TABLE "charity_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "charity_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" real NOT NULL,
	"purchase_date" timestamp NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"expense_type" "expense_type" NOT NULL,
	"routine_category" "routine_category",
	"occasional_group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"fixed_expense_type_id" integer,
	"frequency" "frequency_type",
	"supermarket_id" integer,
	"restaurant_id" integer,
	"occasion_type" "occasion_type" DEFAULT 'normal',
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
	"shopping_purchase_type" "purchase_type" DEFAULT 'in-person',
	"shopping_occasion_type" "occasion_type" DEFAULT 'normal',
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
	"charity_description" text
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "family_members_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "financial_years" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"total_monthly_goal" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financial_years_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE "fixed_expense_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "fixed_expense_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "health_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "health_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "leisure_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "leisure_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "monthly_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"financial_year_id" integer NOT NULL,
	"category" "routine_category" NOT NULL,
	"amount" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasional_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "occasional_group_status" DEFAULT 'open' NOT NULL,
	"description" text,
	"icon_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_care_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "personal_care_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "places_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "restaurants_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "service_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "service_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "shops_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "study_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "study_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "supermarkets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "supermarkets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_financial_year_id_financial_years_id_fk" FOREIGN KEY ("financial_year_id") REFERENCES "public"."financial_years"("id") ON DELETE cascade ON UPDATE no action;