CREATE TABLE problem_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(problem_id, tag_id)
);

CREATE INDEX idx_problem_tags_problem_id ON problem_tags(problem_id);
CREATE INDEX idx_problem_tags_tag_id ON problem_tags(tag_id);

ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problem tags are publicly readable"
    ON problem_tags FOR SELECT
    USING (true);
