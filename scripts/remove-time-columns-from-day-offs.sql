-- Remove start_time and end_time columns from room_day_offs table
-- This migration removes the partial day-off functionality, making all day offs full-day blocks

-- Drop the constraint that checks start_time < end_time
ALTER TABLE room_day_offs
DROP CONSTRAINT IF EXISTS check_start_time_before_end_time;

-- Drop the time columns
ALTER TABLE room_day_offs
DROP COLUMN IF EXISTS start_time,
DROP COLUMN IF EXISTS end_time;
