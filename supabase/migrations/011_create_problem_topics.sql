CREATE TABLE problem_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(problem_id, topic_id)
);

CREATE INDEX idx_problem_topics_problem_id ON problem_topics(problem_id);
CREATE INDEX idx_problem_topics_topic_id ON problem_topics(topic_id);

ALTER TABLE problem_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problem topics are publicly readable"
    ON problem_topics FOR SELECT
    USING (true);
