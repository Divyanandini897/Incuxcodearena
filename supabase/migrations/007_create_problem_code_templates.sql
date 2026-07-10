CREATE TYPE supported_language AS ENUM ('C++', 'Python', 'Java', 'JavaScript', 'Go');

CREATE TABLE problem_code_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language supported_language NOT NULL,
    code_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(problem_id, language)
);

CREATE INDEX idx_problem_code_templates_problem_id ON problem_code_templates(problem_id);

ALTER TABLE problem_code_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Code templates are publicly readable"
    ON problem_code_templates FOR SELECT
    USING (true);

CREATE TRIGGER set_problem_code_templates_updated_at
    BEFORE UPDATE ON problem_code_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
