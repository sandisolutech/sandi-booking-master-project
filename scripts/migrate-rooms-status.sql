-- Migration: Remove is_active column from rooms table and use status column instead
-- This script migrates from boolean is_active to varchar status column

BEGIN;

-- Step 1: Ensure status column exists (it should already exist based on create-rooms-table.sql)
-- If it doesn't exist, create it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.rooms ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- Step 2: Migrate data from is_active to status column
-- Update status based on is_active values
UPDATE public.rooms 
SET status = CASE 
    WHEN is_active = true THEN 'active'
    WHEN is_active = false THEN 'inactive'
    ELSE 'inactive'  -- fallback for null values
END
WHERE is_active IS NOT NULL;

-- Step 3: Set default status for any null is_active values
UPDATE public.rooms 
SET status = 'inactive'
WHERE is_active IS NULL AND status IS NULL;

-- Step 4: Drop the is_active column
ALTER TABLE public.rooms DROP COLUMN IF EXISTS is_active;

-- Step 5: Add constraint to ensure status has valid values
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_status_check 
CHECK (status IN ('active', 'inactive', 'maintenance', 'archived'));

-- Step 6: Create index on status column for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- Step 7: Update the default value for status column to be explicit
ALTER TABLE public.rooms ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.rooms ALTER COLUMN status SET NOT NULL;

COMMIT;
