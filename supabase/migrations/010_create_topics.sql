CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topics_name ON topics(name);
CREATE INDEX idx_topics_slug ON topics(slug);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are publicly readable"
    ON topics FOR SELECT
    USING (true);
