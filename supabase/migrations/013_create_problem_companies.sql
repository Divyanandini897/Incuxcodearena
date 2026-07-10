CREATE TABLE problem_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    frequency INTEGER NOT NULL DEFAULT 0 CHECK (frequency >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(problem_id, company_id)
);

CREATE INDEX idx_problem_companies_problem_id ON problem_companies(problem_id);
CREATE INDEX idx_problem_companies_company_id ON problem_companies(company_id);

ALTER TABLE problem_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problem companies are publicly readable"
    ON problem_companies FOR SELECT
    USING (true);
