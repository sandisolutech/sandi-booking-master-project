# Rooms Status Migration

This migration removes the `is_active` boolean column from the `rooms` table and migrates to using a `status` varchar column with predefined values.

## Changes Made

### Database Schema Changes
- **Removed**: `is_active` BOOLEAN column
- **Enhanced**: `status` VARCHAR(50) column with:
  - Default value: 'active'
  - NOT NULL constraint
  - CHECK constraint: ('active', 'inactive', 'maintenance', 'archived')
  - Database index for performance

### Application Code Changes
- Updated `Room` type in `/app/admin/rooms/actions.ts`
- Removed `isActive` property from Room interface
- Updated `createRoom()` and `updateRoom()` functions to use `status`
- Updated database queries to use `status` column
- Updated test files to use `status` instead of `isActive`

## Data Migration Process

The migration safely converts existing data:
- `is_active = true` → `status = 'active'`
- `is_active = false` → `status = 'inactive'`
- `is_active = null` → `status = 'inactive'` (fallback)

## Running the Migration

### Option 1: Direct SQL
\`\`\`sql
psql -d your_database -f scripts/migrate-rooms-status.sql
\`\`\`

### Option 2: Node.js Runner
\`\`\`bash
node scripts/run-rooms-status-migration.js
\`\`\`

## Status Values

The new `status` column supports these values:
- **active**: Room is available for booking
- **inactive**: Room is temporarily unavailable
- **maintenance**: Room is under maintenance
- **archived**: Room is permanently deactivated

## UI Impact

The existing UI already supports the `status` field:
- Room cards display status badges with appropriate colors  
- Active room filtering works with `room.status === 'active'`
- Add room dialog creates rooms with default 'active' status

## Verification

After migration, verify:
1. All rooms have a valid status value
2. No `is_active` column exists
3. Application functions correctly
4. Room filtering and display work as expected

## Rollback (if needed)

If rollback is required, you would need to:
1. Add back the `is_active` column
2. Convert status values back to boolean
3. Update application code to use `isActive` again

**Note**: This migration is designed to be run once. Make sure to backup your database before running.
