-- CreateTable
CREATE TABLE "contests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration_mins" INTEGER NOT NULL,
    "max_points" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_problems" (
    "id" UUID NOT NULL,
    "contest_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "contest_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_attempts" (
    "id" UUID NOT NULL,
    "contest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),

    CONSTRAINT "contest_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contests_is_published_idx" ON "contests"("is_published");

-- CreateIndex
CREATE INDEX "contests_created_by_idx" ON "contests"("created_by");

-- CreateIndex
CREATE INDEX "contests_starts_at_idx" ON "contests"("starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problems_contest_id_problem_id_key" ON "contest_problems"("contest_id", "problem_id");

-- CreateIndex
CREATE INDEX "contest_problems_contest_id_idx" ON "contest_problems"("contest_id");

-- CreateIndex
CREATE INDEX "contest_problems_problem_id_idx" ON "contest_problems"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_attempts_contest_id_user_id_key" ON "contest_attempts"("contest_id", "user_id");

-- CreateIndex
CREATE INDEX "contest_attempts_contest_id_idx" ON "contest_attempts"("contest_id");

-- CreateIndex
CREATE INDEX "contest_attempts_user_id_idx" ON "contest_attempts"("user_id");

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contest_attempts" ADD CONSTRAINT "contest_attempts_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contest_attempts" ADD CONSTRAINT "contest_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
