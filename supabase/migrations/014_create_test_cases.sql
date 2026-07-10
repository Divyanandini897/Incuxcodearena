CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_test_cases_problem_id ON test_cases(problem_id);

ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test cases are publicly readable"
    ON test_cases FOR SELECT
    USING (true);
