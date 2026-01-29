-- Modify company_logo_url column to store base64 data
-- Change from VARCHAR(255) to TEXT to accommodate base64 encoded images

ALTER TABLE general_config 
ALTER COLUMN company_logo_url TYPE TEXT;

-- Update the column comment for clarity
COMMENT ON COLUMN general_config.company_logo_url IS 'Company logo stored as base64 encoded string or URL';
