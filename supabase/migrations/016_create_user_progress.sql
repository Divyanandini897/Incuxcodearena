CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'solved');

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status progress_status NOT NULL DEFAULT 'not_started',
    last_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    solved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE TRIGGER set_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
