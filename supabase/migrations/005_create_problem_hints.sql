CREATE TABLE problem_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    hint_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_problem_hints_problem_id ON problem_hints(problem_id);

ALTER TABLE problem_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hints are publicly readable"
    ON problem_hints FOR SELECT
    USING (true);
