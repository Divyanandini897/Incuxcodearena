CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    website_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_name ON companies(name);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are publicly readable"
    ON companies FOR SELECT
    USING (true);
