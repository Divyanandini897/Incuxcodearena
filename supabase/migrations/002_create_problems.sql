CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');

CREATE TYPE problem_category AS ENUM ('Algorithms', 'Database', 'Shell', 'Concurrency');

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leetcode_id INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    acceptance NUMERIC(5,2) CHECK (acceptance >= 0 AND acceptance <= 100),
    description TEXT NOT NULL,
    category problem_category NOT NULL DEFAULT 'Algorithms',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_problems_leetcode_id ON problems(leetcode_id);

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problems are publicly readable"
    ON problems FOR SELECT
    USING (true);

CREATE TRIGGER set_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
