-- AlterEnum: add Basic to DifficultyLevel
ALTER TYPE "difficulty_level" ADD VALUE 'Basic' AFTER 'Easy';

-- AlterTable: add is_custom column to problems
ALTER TABLE "problems" ADD COLUMN "is_custom" BOOLEAN NOT NULL DEFAULT false;
