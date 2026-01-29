-- Migration: Create booking_custom_field_values table
-- This table stores individual custom field values for bookings
-- replacing the JSON column approach for better queryability and maintenance

CREATE TABLE IF NOT EXISTS booking_custom_field_values (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    value TEXT,
    value_type VARCHAR(50) NOT NULL,
    key VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE(booking_id, key)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_booking_custom_field_values_booking_id 
    ON booking_custom_field_values(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_custom_field_values_key 
    ON booking_custom_field_values(key);

CREATE INDEX IF NOT EXISTS idx_booking_custom_field_values_booking_key 
    ON booking_custom_field_values(booking_id, key);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_custom_field_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_booking_custom_field_values_updated_at 
    ON booking_custom_field_values;

CREATE TRIGGER update_booking_custom_field_values_updated_at
    BEFORE UPDATE ON booking_custom_field_values
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_custom_field_values_updated_at();
