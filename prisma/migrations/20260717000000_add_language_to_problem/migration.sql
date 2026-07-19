-- Add language column to problems table
ALTER TABLE "public"."problems" ADD COLUMN IF NOT EXISTS "language" "public"."supported_language";

-- Create index for language-based queries
CREATE INDEX IF NOT EXISTS problems_language_idx ON "public"."problems" ("language");
