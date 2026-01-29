-- Add custom_key column to custom_fields table
ALTER TABLE custom_fields 
ADD COLUMN IF NOT EXISTS custom_key VARCHAR(100) UNIQUE;

-- Add comment for the column
COMMENT ON COLUMN custom_fields.custom_key IS 'Unique identifier key for the custom field, used for API references and integrations';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_custom_key ON custom_fields(custom_key);
