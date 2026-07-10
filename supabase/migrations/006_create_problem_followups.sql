CREATE TABLE problem_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    followup_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_problem_followups_problem_id ON problem_followups(problem_id);

ALTER TABLE problem_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followups are publicly readable"
    ON problem_followups FOR SELECT
    USING (true);
