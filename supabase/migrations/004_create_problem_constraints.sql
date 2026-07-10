CREATE TABLE problem_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    constraint_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_problem_constraints_problem_id ON problem_constraints(problem_id);

ALTER TABLE problem_constraints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Constraints are publicly readable"
    ON problem_constraints FOR SELECT
    USING (true);
