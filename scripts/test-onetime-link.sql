-- Test script for oneTime booking link functionality
-- This script demonstrates how to test the oneTime link feature

-- Step 1: Create a test oneTime booking link
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
) VALUES (
    'Test OneTime Link',
    'This is a test oneTime booking link',
    'test-onetime-uuid-12345',
    true,
    'oneTime',
    'auto',
    'unlimited',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Check if the link exists and is usable (should return 1 row)
SELECT 
    id, 
    name, 
    link_type, 
    is_active,
    (SELECT COUNT(*) FROM bookings WHERE link_id = booking_links.id) as booking_count,
    CASE 
        WHEN link_type = 'oneTime' AND (SELECT COUNT(*) FROM bookings WHERE link_id = booking_links.id) > 0 
        THEN 'LINK_USED' 
        ELSE 'LINK_AVAILABLE' 
    END as link_status
FROM booking_links 
WHERE uuid = 'test-onetime-uuid-12345';

-- Step 3: Simulate creating a booking for this link
-- (Note: You'll need to replace the link_id with the actual ID from step 2)
-- INSERT INTO bookings (
--     name, 
--     email, 
--     selected_date, 
--     selected_room_id, 
--     selected_time_slot_id, 
--     agreed_to_terms, 
--     status, 
--     link_id, 
--     booking_number, 
--     company_id, 
--     created_at, 
--     updated_at
-- ) VALUES (
--     'Test User',
--     'test@example.com',
--     CURRENT_DATE + INTERVAL '1 day',
--     1, -- Replace with actual room ID
--     1, -- Replace with actual time slot ID
--     true,
--     'pending',
--     [LINK_ID_FROM_STEP_2], -- Replace with actual link ID
--     'TEST-' || EXTRACT(EPOCH FROM NOW())::text,
--     1, -- Replace with actual company ID
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- );

-- Step 4: Check the link status again (should now show 'LINK_USED')
-- SELECT 
--     id, 
--     name, 
--     link_type, 
--     is_active,
--     (SELECT COUNT(*) FROM bookings WHERE link_id = booking_links.id) as booking_count,
--     CASE 
--         WHEN link_type = 'oneTime' AND (SELECT COUNT(*) FROM bookings WHERE link_id = booking_links.id) > 0 
--         THEN 'LINK_USED' 
--         ELSE 'LINK_AVAILABLE' 
--     END as link_status
-- FROM booking_links 
-- WHERE uuid = 'test-onetime-uuid-12345';

-- Cleanup (optional)
-- DELETE FROM bookings WHERE link_id = (SELECT id FROM booking_links WHERE uuid = 'test-onetime-uuid-12345');
-- DELETE FROM booking_links WHERE uuid = 'test-onetime-uuid-12345';
