-- AlterTable: add reminder_minutes to contests
ALTER TABLE "contests" ADD COLUMN "reminder_minutes" INTEGER DEFAULT 10;

-- CreateTable: contest_registrations
CREATE TABLE "contest_registrations" (
    "id" UUID NOT NULL,
    "contest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contest_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_registrations_contest_id_user_id_key" ON "contest_registrations"("contest_id", "user_id");
CREATE INDEX "contest_registrations_contest_id_idx" ON "contest_registrations"("contest_id");
CREATE INDEX "contest_registrations_user_id_idx" ON "contest_registrations"("user_id");

-- AddForeignKey
ALTER TABLE "contest_registrations" ADD CONSTRAINT "contest_registrations_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "contest_registrations" ADD CONSTRAINT "contest_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
