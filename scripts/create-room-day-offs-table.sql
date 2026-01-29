-- Migration: Create room_day_offs table for day off settings
-- Stores day off dates and recurring patterns for each room

CREATE TABLE IF NOT EXISTS room_day_offs (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    day_off_date DATE,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday) for recurring day offs
    recurrence_type VARCHAR(50) NOT NULL DEFAULT 'once', -- 'once', 'weekly', 'monthly', 'yearly'
    reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT room_day_offs_recurrence_check CHECK (recurrence_type IN ('once', 'weekly', 'monthly', 'yearly'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_room_day_offs_room_id 
    ON room_day_offs(room_id);

CREATE INDEX IF NOT EXISTS idx_room_day_offs_date 
    ON room_day_offs(day_off_date);

CREATE INDEX IF NOT EXISTS idx_room_day_offs_day_of_week 
    ON room_day_offs(day_of_week);

CREATE INDEX IF NOT EXISTS idx_room_day_offs_active
    ON room_day_offs(is_active);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_day_offs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_room_day_offs_updated_at 
    ON room_day_offs;

CREATE TRIGGER update_room_day_offs_updated_at
    BEFORE UPDATE ON room_day_offs
    FOR EACH ROW
    EXECUTE FUNCTION update_room_day_offs_updated_at();
