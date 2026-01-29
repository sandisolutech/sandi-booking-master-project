-- Remove CHECK constraint from custom_fields table
-- This allows any field_type value and gives more flexibility

ALTER TABLE custom_fields 
DROP CONSTRAINT IF EXISTS custom_fields_field_type_check;
