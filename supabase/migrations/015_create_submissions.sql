CREATE TYPE submission_status AS ENUM (
    'Accepted',
    'Wrong Answer',
    'Compile Error',
    'Runtime Error',
    'Time Limit Exceeded'
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language supported_language NOT NULL,
    code TEXT NOT NULL,
    status submission_status NOT NULL,
    runtime TEXT,
    memory TEXT,
    test_results JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions"
    ON submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
    ON submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
