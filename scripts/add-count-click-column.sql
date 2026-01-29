-- Add count_click column to booking_links table if it doesn't exist
-- This column tracks how many times a booking link has been clicked/visited

ALTER TABLE booking_links 
ADD COLUMN IF NOT EXISTS count_click INTEGER DEFAULT 0;

-- Update existing records to have a default value of 0 if they are NULL
UPDATE booking_links 
SET count_click = 0 
WHERE count_click IS NULL;
