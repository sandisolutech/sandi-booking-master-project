# Timezone Issues in Time Slot Availability System

## Summary
The time slot availability system has **CRITICAL timezone bugs** similar to the day-off bug. The code uses `Date.getDay()` which returns **UTC day-of-week** instead of Bangkok day-of-week, causing incorrect time slot filtering across different timezones.

---

## Issues Found

### 1. **Critical: `checkTimeSlotAvailability()` function - Line 31 in booking-availability.ts**
**File:** `/Users/sandi/Documents/sandi-booking-project/app/register/booking-availability.ts`
**Line:** 31

```typescript
const dayOfWeek = selectedDate.getDay() // 0-6 (Sunday-Saturday)
```

**Problem:** 
- Uses `getDay()` which returns UTC day-of-week, not Bangkok day-of-week
- This affects time slot filtering in the query on line 50:
  ```typescript
  AND rtsa.day_of_week = ${dayOfWeek}
  ```
- Result: Users may see incorrect time slot availability based on their local timezone

**Example:** 
- A Bangkok user on Monday (day 1) at 11 PM (UTC+7) is actually Monday in UTC, but `getDay()` might return Sunday (0) depending on their actual local timezone
- Time slots configured for Monday might be unavailable or vice versa

---

### 2. **Critical: `isTimeSlotAvailable()` function - Line 109 in booking-availability.ts**
**File:** `/Users/sandi/Documents/sandi-booking-project/app/register/booking-availability.ts`
**Line:** 109

```typescript
const dayOfWeek = selectedDate.getDay() // 0-6 (Sunday-Saturday)
```

**Problem:**
- Same issue as `checkTimeSlotAvailability()` 
- Used in time slot query on line 126:
  ```typescript
  AND rtsa.day_of_week = ${dayOfWeek}
  ```
- Affects availability checks when booking a specific time slot

---

### 3. **Secondary: `isDayOff()` function in dayoff-adaptor.ts - Line 215**
**File:** `/Users/sandi/Documents/sandi-booking-project/lib/dayoff-adaptor.ts`
**Line:** 215

```typescript
if (dayOff.recurrenceType === 'weekly' && dayOff.dayOfWeek !== undefined) {
  return date.getDay() === dayOff.dayOfWeek
}
```

**Problem:**
- Uses `getDay()` for comparing day-off recurrence patterns
- While not directly affecting time slots, this could cause day-off conflicts with time slot availability

---

### 4. **Secondary: `calculateNextOccurrence()` in dayoff-adaptor.ts - Line 155**
**File:** `/Users/sandi/Documents/sandi-booking-project/lib/dayoff-adaptor.ts`
**Line:** 155

```typescript
const currentDay = next.getDay()
```

**Problem:**
- Uses `getDay()` for calculating next occurrence dates
- Not directly related to time slots but shows broader timezone issue pattern

---

### 5. **Secondary: `day-off-settings-card.tsx` - Line 126**
**File:** `/Users/sandi/Documents/sandi-booking-project/components/day-off-settings-card.tsx`
**Line:** 126

```typescript
return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
```

**Problem:**
- Uses `getDay()` for UI calendar calculations
- Affects calendar display for day-off management

---

## Table Schema: `room_time_slot_availability`

**File:** `/Users/sandi/Documents/sandi-booking-project/scripts/create-room-time-slot-availability-table.sql`

```sql
CREATE TABLE IF NOT EXISTS room_time_slot_availability (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    time_round_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (time_round_id) REFERENCES time_rounds(id) ON DELETE CASCADE,
    CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT unique_room_time_slot_day UNIQUE (room_id, time_round_id, day_of_week)
);
```

**day_of_week values:** 0-6 (Sunday-Saturday)  
**Indexes:** On `day_of_week`, `room_id`, `is_available`

---

## Relationship Between Components

```
┌─────────────────────────────────────────────────────────────┐
│ checkTimeSlotAvailability(selectedDate, selectedRoomId)     │
│ - Calculates: dayOfWeek = selectedDate.getDay() ❌         │
│ - Uses: room_time_slot_availability.day_of_week filtering   │
│ - Returns: TimeSlotAvailability[] with current bookings      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├─→ time_rounds (all active rounds)
                          │
                          ├─→ room_time_slot_availability
                          │   (filtered by room + day_of_week)
                          │
                          └─→ bookings (for counting current bookings)
```

---

## Where `day_of_week` is Used

### For Filtering Time Slots (TIMEZONE-CRITICAL):
1. **booking-availability.ts:50** - `rtsa.day_of_week = ${dayOfWeek}` (in checkTimeSlotAvailability)
2. **booking-availability.ts:126** - `rtsa.day_of_week = ${dayOfWeek}` (in isTimeSlotAvailable)

### For Admin Configuration:
3. **room-time-slots-availability.tsx:114** - Saves availability with `dayOfWeek: day` (0-6)
4. **rooms/actions.ts:296** - INSERT into room_time_slot_availability with dayOfWeek
5. **rooms/actions.ts:267** - INSERT with dayOfWeek in setRoomTimeSlotAvailability

### Storage/Retrieval:
6. **rooms/actions.ts:247** - SELECT from room_time_slot_availability
7. **rooms/actions.ts:61** - Maps `row.day_of_week` to `dayOfWeek` property

---

## Already Fixed Functions (Using Bangkok Timezone)

These functions CORRECTLY use Bangkok timezone:
- `getDayOfWeekInThailand()` in utils.ts:52 ✅
- `getRoomDayOffInfo()` uses `getDayOfWeekInThailand()` ✅
- `getRoomDayOffsForDateRange()` uses PostgreSQL `EXTRACT(DOW FROM date)` ✅
- `isRoomDayOff()` uses `getDayOfWeekInThailand()` ✅

---

## Root Cause

The issue is **inconsistent use of timezone-aware functions**:

| Function | Uses `.getDay()` ❌ | Uses `getDayOfWeekInThailand()` ✅ |
|----------|---------|----------|
| `checkTimeSlotAvailability()` | ✅ | ❌ |
| `isTimeSlotAvailable()` | ✅ | ❌ |
| `isRoomDayOff()` | ❌ | ✅ |
| `getRoomDayOffInfo()` | ❌ | ✅ |
| `isDayOff()` in dayoff-adaptor | ✅ | ❌ |

---

## Impact

### High Risk (Booking Availability):
- Users in different timezones see different available time slots
- Time slots configured for Monday might be unavailable on Sunday
- Booking system fails on timezone boundaries

### Medium Risk (UI/Display):
- Calendar displays incorrect day numbers
- Day-off calculations may be off by a day
- Next occurrence dates may be wrong

### All Affected Flows:
1. Register page - `/app/register/[linkId]/page.tsx` line 167
2. Create booking dialog - `components/create-booking-dialog.tsx` line 108
3. Admin time slot configuration - `components/room-time-slots-availability.tsx`
4. Day-off management UI - `components/day-off-settings-card.tsx`

---

## Files Requiring Fixes

| Priority | File | Issues |
|----------|------|--------|
| **CRITICAL** | `/Users/sandi/Documents/sandi-booking-project/app/register/booking-availability.ts` | Lines 31, 109 |
| **HIGH** | `/Users/sandi/Documents/sandi-booking-project/lib/dayoff-adaptor.ts` | Lines 155, 215 |
| **HIGH** | `/Users/sandi/Documents/sandi-booking-project/components/day-off-settings-card.tsx` | Line 126 |

---

## Fix Pattern

Replace:
```typescript
const dayOfWeek = selectedDate.getDay()
```

With:
```typescript
const dayOfWeek = getDayOfWeekInThailand(selectedDate)
```

Or for UI components without server functions:
```typescript
const dayOfWeek = new Date(
  selectedDate.getFullYear(), 
  selectedDate.getMonth(), 
  selectedDate.getDate()
).getDay()
```

---

## Summary Table

| Issue # | File | Line | Function | Problem | Fix |
|---------|------|------|----------|---------|-----|
| 1 | booking-availability.ts | 31 | checkTimeSlotAvailability | Uses `getDay()` for filtering | Use `getDayOfWeekInThailand()` |
| 2 | booking-availability.ts | 109 | isTimeSlotAvailable | Uses `getDay()` for filtering | Use `getDayOfWeekInThailand()` |
| 3 | dayoff-adaptor.ts | 215 | isDayOff | Uses `getDay()` for weekly check | Use `getDayOfWeekInThailand()` |
| 4 | dayoff-adaptor.ts | 155 | calculateNextOccurrence | Uses `getDay()` for calculation | Use `getDayOfWeekInThailand()` |
| 5 | day-off-settings-card.tsx | 126 | getFirstDayOfMonth | Uses `getDay()` for calendar | Use localization approach |
