-- Add company_cover_image_url column to general_config table
ALTER TABLE general_config
ADD COLUMN IF NOT EXISTS company_cover_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN general_config.company_cover_image_url IS 'Base64-encoded cover image for booking page (PNG, JPG, GIF, SVG - max 512KB)';
