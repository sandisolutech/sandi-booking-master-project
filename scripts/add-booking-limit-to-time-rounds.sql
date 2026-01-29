-- Add booking_limit column to time_rounds table
ALTER TABLE time_rounds ADD COLUMN IF NOT EXISTS booking_limit INTEGER NOT NULL DEFAULT 1;

-- Add a comment to explain the column
COMMENT ON COLUMN time_rounds.booking_limit IS 'Maximum number of bookings allowed for this time slot';

-- Optional: Add a check constraint to ensure booking_limit is positive
ALTER TABLE time_rounds ADD CONSTRAINT check_booking_limit_positive CHECK (booking_limit > 0);
