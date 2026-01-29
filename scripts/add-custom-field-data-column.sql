-- Migration: Add custom_field_data column to bookings table
-- This column will store JSON data of custom field values submitted with each booking

ALTER TABLE bookings 
ADD COLUMN custom_field_data JSON;

-- Update the column to have a default empty object for existing records
UPDATE bookings 
SET custom_field_data = '{}' 
WHERE custom_field_data IS NULL;
