# LINE Configuration Setup

This feature allows you to configure LINE LIFF integration directly from the admin panel instead of editing the `.env` file manually.

## How to Set Up LINE Integration

### 1. Access Admin Settings
1. Log in to your admin panel
2. Navigate to **Settings** → **LINE** tab

### 2. Configure LINE LIFF ID
1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create or select your LINE Login channel
3. Go to the **LIFF** tab and create a new LIFF app
4. Copy the LIFF ID (format: `1234567890-abcdefgh`)
5. Paste it in the **LINE LIFF ID** field in your admin settings
6. Set the endpoint URL to your booking domain

### 3. Customize Messages
- **Success Message**: This message will be sent to users via LINE when their booking is confirmed
- **Cancel Message**: This message will be sent to users via LINE when their booking is cancelled

### 4. Save Configuration
Click "Save LINE Settings" to apply your changes.

## Features

### ✅ **What's New:**
- **Admin Panel Configuration**: Set up LINE integration without touching code
- **Database Storage**: All LINE settings are stored in the database
- **Dynamic LIFF ID**: The system automatically uses the LIFF ID from database instead of `.env`
- **Custom Messages**: Configure success and cancellation messages for LINE users
- **Fallback Support**: If database config fails, falls back to environment variables

### 🔧 **Technical Details:**

#### Database Table
A new `line_config` table stores:
- `liff_id`: LINE LIFF application ID
- `success_message`: Message sent on successful booking
- `cancel_message`: Message sent on booking cancellation

#### API Endpoint
- `GET /api/line-config`: Returns current LINE configuration

#### Updated Hook
The `useLiff` hook now:
- Fetches LIFF ID from database instead of `.env`
- Provides `getSuccessMessage()` and `getCancelMessage()` functions
- Falls back to environment variables if database fetch fails

## Migration

If you're upgrading from environment-based configuration:

1. Your existing `NEXT_PUBLIC_LIFF_ID` in `.env` will still work as a fallback
2. Run the application - the LINE config table will be created automatically
3. Go to Admin Settings → LINE tab to configure your settings
4. Once configured in the admin panel, the database values will take precedence

## Usage in Code

\`\`\`typescript
import { useLiff } from '@/hooks/use-liff'

const { 
  isLoggedIn, 
  sendMessage,
  getSuccessMessage,
  getCancelMessage,
  sendBookingMessage
} = useLiff()

// Send custom success message with variables
const messageVariables = {
  booking_number: 'BK-12345',
  company_name: 'Acme Corp',
  date: 'December 25, 2024',
  time_slot: '09:00 - 10:00',
  room_name: 'Conference Room A',
  customer_name: 'John Doe',
  booking_link: 'https://yoursite.com/booking/BK-12345',
  cancel_link: 'https://yoursite.com/booking/BK-12345',
  support_email: 'support@yoursite.com'
}

// Send booking confirmation message
await sendBookingMessage('success', messageVariables)

// Send booking cancellation message
await sendBookingMessage('cancel', messageVariables)

// Or get formatted messages directly
const successMsg = await getSuccessMessage(messageVariables)
await sendMessage(successMsg)

const cancelMsg = await getCancelMessage(messageVariables)
await sendMessage(cancelMsg)
\`\`\`

## Available Variables

The following variables can be used in your success and cancel messages:

- `{{booking_number}}` - The booking confirmation number
- `{{company_name}}` - Name of the company being booked
- `{{date}}` - The booking date (formatted)
- `{{time_slot}}` - The time slot (e.g., 09:00 - 10:00)
- `{{room_name}}` - Name of the booked room
- `{{customer_name}}` - Customer name from custom fields
- `{{booking_link}}` - Link to view booking details
- `{{cancel_link}}` - Link to cancel the booking
- `{{support_email}}` - Company support email

## Example Messages

**Success Message:**
\`\`\`
🎉 Booking Confirmed!

Booking #: {{booking_number}}
Company: {{company_name}}
Date: {{date}}
Time: {{time_slot}}
Room: {{room_name}}

View details: {{booking_link}}

Thank you for your booking!
\`\`\`

**Cancel Message:**
\`\`\`
❌ Booking Cancelled

Your booking {{booking_number}} has been cancelled.

If you need assistance, please contact our support team at {{support_email}}.
\`\`\`

## Troubleshooting

1. **LIFF ID not working**: Check the format (should be like `1234567890-abcdefgh`)
2. **Messages not customizing**: Make sure you saved the settings in admin panel
3. **Fallback to env**: If database connection fails, it will use `NEXT_PUBLIC_LIFF_ID`
4. **Multiple records in database**: 
   - The system is designed to have only one LINE config record (id = 1)
   - If you see multiple records, run the cleanup script: `node scripts/cleanup-line-config.mjs`
   - A database constraint prevents future duplicates from being created

### Cleanup Scripts

If you encounter duplicate records in the `line_config` table, run:

\`\`\`bash
# Clean up existing duplicates
node scripts/cleanup-line-config.mjs

# Add constraint to prevent future duplicates (optional, it's added automatically)
node scripts/add-line-config-constraint.mjs
\`\`\`

## Environment Variables (Fallback)

These are still supported as fallbacks:
\`\`\`env
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
\`\`\`
