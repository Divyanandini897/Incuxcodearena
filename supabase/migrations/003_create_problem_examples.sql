CREATE TABLE problem_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    explanation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_problem_examples_problem_id ON problem_examples(problem_id);

ALTER TABLE problem_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examples are publicly readable"
    ON problem_examples FOR SELECT
    USING (true);
