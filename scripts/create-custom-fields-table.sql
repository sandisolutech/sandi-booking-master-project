CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    custom_key VARCHAR(100) UNIQUE,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'text', 'number', 'email', 'password', 'tel', 'url', 'search',
        'date', 'time', 'datetime-local', 'month', 'week',
        'color', 'range', 'file', 'checkbox', 'radio',
        'textarea', 'select', 'multiple_select'
    )),
    is_required BOOLEAN DEFAULT FALSE,
    placeholder VARCHAR(255),
    options TEXT, -- JSON array for select/radio/checkbox options
    min_value VARCHAR(50), -- For number, range, date inputs
    max_value VARCHAR(50), -- For number, range, date inputs
    step_value VARCHAR(50), -- For number, range inputs
    accept_types VARCHAR(255), -- For file input (e.g., '.pdf,.doc,.jpg')
    multiple_files BOOLEAN DEFAULT FALSE, -- For file input
    max_length INTEGER, -- For text inputs
    pattern VARCHAR(500), -- Regex pattern for validation
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_active_order ON custom_fields(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_custom_fields_custom_key ON custom_fields(custom_key);

-- Add comment for the custom_key column
COMMENT ON COLUMN custom_fields.custom_key IS 'Unique identifier key for the custom field, used for API references and integrations';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_fields_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_fields_updated_at
    BEFORE UPDATE ON custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_fields_updated_at();
