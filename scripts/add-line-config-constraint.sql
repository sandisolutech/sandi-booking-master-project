-- Add unique constraint to line_config table to prevent multiple configuration records
-- This ensures only one configuration record can exist

ALTER TABLE line_config 
ADD CONSTRAINT line_config_single_record_constraint 
CHECK (id = 1);
