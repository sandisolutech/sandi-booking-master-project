-- Clean up duplicate line_config records and keep only one
-- This script will remove all duplicate records and keep only the first one

BEGIN;

-- Create a temporary table with the record we want to keep (the one with the lowest ID)
CREATE TEMP TABLE line_config_keeper AS
SELECT * FROM line_config ORDER BY id LIMIT 1;

-- Delete all records from line_config
DELETE FROM line_config;

-- Insert the keeper record back with ID = 1
INSERT INTO line_config (id, liff_id, success_message, cancel_message, created_at, updated_at)
SELECT 1, liff_id, success_message, cancel_message, created_at, updated_at
FROM line_config_keeper;

-- Reset the sequence to start from 2 (so next insert would be ID 2)
SELECT setval('line_config_id_seq', 1, true);

COMMIT;

-- Verify the result
SELECT COUNT(*) as total_records FROM line_config;
SELECT * FROM line_config;
