-- Migration: Create room_time_slot_availability table
-- Stores which time slots are available for each room on each day of week
-- Default behavior: all time slots are available for all days initially

CREATE TABLE IF NOT EXISTS room_time_slot_availability (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    time_round_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (time_round_id) REFERENCES time_rounds(id) ON DELETE CASCADE,
    CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT unique_room_time_slot_day UNIQUE (room_id, time_round_id, day_of_week)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_room_time_slot_availability_room_id 
    ON room_time_slot_availability(room_id);

CREATE INDEX IF NOT EXISTS idx_room_time_slot_availability_day_of_week 
    ON room_time_slot_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_room_time_slot_availability_available
    ON room_time_slot_availability(is_available);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_time_slot_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_room_time_slot_availability_updated_at 
    ON room_time_slot_availability;

CREATE TRIGGER update_room_time_slot_availability_updated_at
    BEFORE UPDATE ON room_time_slot_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_room_time_slot_availability_updated_at();
