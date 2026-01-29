-- Add LINE profile data columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS line_display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS line_picture_url TEXT,
ADD COLUMN IF NOT EXISTS line_status_message TEXT;

-- Create index for line_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_line_user_id ON bookings(line_user_id);
