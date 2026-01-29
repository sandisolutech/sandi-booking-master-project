# Timezone Bug Fix Summary

## Problem
When day-off dates were set to "Tuesday" (or any weekday) in Bangkok timezone:
- **Local development (Bangkok TZ):** Worked correctly ✓
- **Production (Vercel/UTC):** Blocked the wrong day (Wednesday instead of Tuesday) ✗

This was a 1-day shift due to UTC vs Bangkok timezone offset (UTC+7).

## Root Cause
The code used `Date.getDay()` which returns the day-of-week based on the Date object's **internal UTC representation**, not the Bangkok timezone. This caused different results across different environments.

## Solution Implemented

### 1. New Timezone-Safe Helper Functions (`lib/utils.ts`)
Added two new functions that extract day-of-week and day-of-month from Bangkok timezone:

```typescript
// Get day of week (0-6) in Thailand timezone
export function getDayOfWeekInThailand(date: Date): number {
  const dateString = formatDateForDB(date); // YYYY-MM-DD in Bangkok TZ
  const [year, month, day] = dateString.split('-').map(Number);
  const bangkokDate = new Date(year, month - 1, day);
  return bangkokDate.getDay();
}

// Get day of month in Thailand timezone
export function getDayOfMonthInThailand(date: Date): number {
  const dateString = formatDateForDB(date); // YYYY-MM-DD in Bangkok TZ
  const [year, month, day] = dateString.split('-').map(Number);
  return day;
}
```

### 2. Fixed `isRoomDayOff()` (`app/register/booking-availability.ts`)
**Before:**
```typescript
const dayOfWeek = selectedDate.getDay() // ❌ Uses browser/UTC timezone
const dayOfMonth = selectedDate.getDate() // ❌ Uses browser/UTC timezone
```

**After:**
```typescript
const dayOfWeek = getDayOfWeekInThailand(selectedDate) // ✓ Uses Bangkok timezone
const dayOfMonth = getDayOfMonthInThailand(selectedDate) // ✓ Uses Bangkok timezone
```

### 3. Fixed `getRoomDayOffInfo()` (`app/register/booking-availability.ts`)
Same fix as `isRoomDayOff()` - replaced `getDay()` and `getDate()` with timezone-safe functions.

### 4. Fixed `formatDateForAPI()` (`lib/dayoff-adaptor.ts`)
**Before:**
```typescript
const month = String(d.getMonth() + 1).padStart(2, '0')
const day = String(d.getDate()).padStart(2, '0')
return `${d.getFullYear()}-${month}-${day}` // ❌ Uses browser timezone
```

**After:**
```typescript
return formatDateForDB(d) // ✓ Uses Bangkok timezone consistently
```

## Why This Works
1. **`formatDateForDB()`** uses `toLocaleDateString()` with `timeZone: 'Asia/Bangkok'` to get the date string in Bangkok time
2. **New functions parse this string** to extract year/month/day in Bangkok timezone
3. **Create a local Date object** from those values (avoiding UTC conversion)
4. **Call `getDay()` on this local date** - which now correctly represents the Bangkok timezone day

## Testing
✓ Code compiles successfully  
✓ No TypeScript errors  
✓ All imports resolved correctly

## Expected Result
After deploying to production:
- Day-off blocking will work correctly in all timezones
- Tuesday day-offs will block Tuesday (not Wednesday)
- Weekly recurring day-offs will match the intended day
- Monthly and yearly day-offs will work consistently across all environments
