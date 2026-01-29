-- Add time fields to room_day_offs table for partial day-off support
-- This allows marking specific hours as unavailable (e.g., 09:00-12:00)

ALTER TABLE room_day_offs ADD COLUMN start_time TIME;
ALTER TABLE room_day_offs ADD COLUMN end_time TIME;

-- Add check constraint to ensure start_time < end_time if both are provided
ALTER TABLE room_day_offs
ADD CONSTRAINT check_start_time_before_end_time
CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time);

-- Add comment documenting the purpose
COMMENT ON COLUMN room_day_offs.start_time IS 'Start time of day-off period (HH:mm format). NULL means entire day is unavailable.';
COMMENT ON COLUMN room_day_offs.end_time IS 'End time of day-off period (HH:mm format). NULL means entire day is unavailable.';
