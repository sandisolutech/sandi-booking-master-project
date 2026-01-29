-- Test script for approval mode functionality
-- This script demonstrates how to test the auto/manual approval modes

-- Step 1: Create test booking links with different approval modes
INSERT INTO booking_links (
    name, 
    description, 
    uuid, 
    is_active, 
    link_type, 
    approval_mode, 
    expiration_type, 
    count_click,
    created_at, 
    updated_at
) VALUES 
-- Auto approval link
(
    'Auto Approval Link',
    'Bookings through this link are automatically confirmed',
    'auto-approval-uuid-12345',
    true,
    'reusable',
    'auto',
    'unlimited',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Manual approval link
(
    'Manual Approval Link',
    'Bookings through this link require manual approval',
    'manual-approval-uuid-67890',
    true,
    'reusable',
    'manual',
    'unlimited',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Check the created links
SELECT 
    id, 
    name, 
    approval_mode, 
    is_active,
    uuid
FROM booking_links 
WHERE uuid IN ('auto-approval-uuid-12345', 'manual-approval-uuid-67890')
ORDER BY approval_mode;

-- Step 3: Test booking creation with different approval modes
-- After creating bookings through the UI, you can check their status:

-- Check bookings for auto approval link (should have status 'confirmed')
SELECT 
    b.id,
    b.name,
    b.status,
    b.booking_number,
    bl.approval_mode,
    bl.name as link_name
FROM bookings b
JOIN booking_links bl ON b.link_id = bl.id
WHERE bl.uuid = 'auto-approval-uuid-12345'
ORDER BY b.created_at DESC;

-- Check bookings for manual approval link (should have status 'pending')
SELECT 
    b.id,
    b.name,
    b.status,
    b.booking_number,
    bl.approval_mode,
    bl.name as link_name
FROM bookings b
JOIN booking_links bl ON b.link_id = bl.id
WHERE bl.uuid = 'manual-approval-uuid-67890'
ORDER BY b.created_at DESC;

-- Step 4: Summary query to see all bookings with their approval modes and statuses
SELECT 
    bl.name as link_name,
    bl.approval_mode,
    b.name as customer_name,
    b.status,
    b.booking_number,
    b.created_at,
    CASE 
        WHEN bl.approval_mode = 'auto' AND b.status = 'confirmed' THEN '✅ CORRECT'
        WHEN bl.approval_mode = 'manual' AND b.status = 'pending' THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as status_check
FROM bookings b
JOIN booking_links bl ON b.link_id = bl.id
WHERE bl.uuid IN ('auto-approval-uuid-12345', 'manual-approval-uuid-67890')
ORDER BY b.created_at DESC;

-- Cleanup (optional)
-- DELETE FROM bookings WHERE link_id IN (
--     SELECT id FROM booking_links 
--     WHERE uuid IN ('auto-approval-uuid-12345', 'manual-approval-uuid-67890')
-- );
-- DELETE FROM booking_links WHERE uuid IN ('auto-approval-uuid-12345', 'manual-approval-uuid-67890');
