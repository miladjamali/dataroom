DROP TABLE "posts_table" CASCADE;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;