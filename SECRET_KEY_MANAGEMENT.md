# Secret Key Management System

This guide explains how to use the new Secret Key Management system for API authentication.

## Overview

The Secret Key Management system allows you to:
- Create and manage API secret keys
- Secure your booking API endpoints
- Track usage and manage expiration
- Control access to your booking data

## Features

### 1. **Secret Key Management Interface**
- Located at: `/admin/settings/secret-keys`
- Create new secret keys with custom names and descriptions
- Set expiration dates (optional)
- View usage statistics (last used date)
- Activate/deactivate keys
- Regenerate keys
- Delete keys

### 2. **API Authentication**
Secret keys can be provided in three ways:

**Header (Recommended):**
\`\`\`bash
curl -H "x-secret-key: sk_your_key_here" \
     "https://yourdomain.com/api/bookings"
\`\`\`

**Bearer Token:**
\`\`\`bash
curl -H "Authorization: Bearer sk_your_key_here" \
     "https://yourdomain.com/api/bookings"
\`\`\`

**Query Parameter:**
\`\`\`bash
curl "https://yourdomain.com/api/bookings?secret_key=sk_your_key_here"
\`\`\`

### 3. **Enhanced Booking API**
The `/api/bookings` endpoint now supports:

**Get all bookings:**
\`\`\`bash
curl -H "x-secret-key: sk_your_key_here" \
     "https://yourdomain.com/api/bookings"
\`\`\`

**Filter by custom field:**
\`\`\`bash
curl -H "x-secret-key: sk_your_key_here" \
     "https://yourdomain.com/api/bookings?customKey=email&value=john@example.com"
\`\`\`

**Additional filters:**
\`\`\`bash
curl -H "x-secret-key: sk_your_key_here" \
     "https://yourdomain.com/api/bookings?customKey=phone&value=1234567890&status=confirmed&startDate=2024-01-01&endDate=2024-12-31&page=1&pageSize=10"
\`\`\`

## API Response Format

\`\`\`json
{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "selectedDate": "2024-01-15",
      "roomId": 1,
      "roomName": "Conference Room A",
      "timeSlotId": 1,
      "timeSlotStartTime": "09:00:00",
      "timeSlotEndTime": "10:00:00",
      "timeSlotName": "Morning Slot",
      "customCompanyName": "ABC Corp",
      "agreedToTerms": true,
      "status": "confirmed",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z",
      "bookingNumber": "BK001",
      "companyId": 1,
      "companyName": "ABC Corp",
      "customFieldData": {
        "1": {
          "title": "Email",
          "value": "john@example.com",
          "fieldType": "email"
        },
        "2": {
          "title": "Phone",
          "value": "1234567890", 
          "fieldType": "tel"
        }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
\`\`\`

## Getting Started

### 1. Create Your First Secret Key
1. Navigate to `/admin/settings/secret-keys`
2. Click "Create Secret Key"
3. Enter a name (e.g., "Production API Key")
4. Add a description (optional)
5. Set expiration date (optional)
6. Click "Create Secret Key"

### 2. Copy Your Secret Key
- Click the eye icon to reveal the full key
- Click the copy icon to copy to clipboard
- **Important:** Store this key securely - you won't be able to see it again after leaving the page

### 3. Use Your Secret Key
Include the secret key in your API requests using one of the authentication methods above.

### 4. Monitor Usage
- View when keys were last used
- Check if keys are approaching expiration
- Monitor active/inactive status

## Security Best Practices

1. **Keep Keys Secure**: Never commit secret keys to version control
2. **Use Environment Variables**: Store keys in environment variables
3. **Regular Rotation**: Regenerate keys periodically
4. **Minimal Permissions**: Create separate keys for different applications
5. **Monitor Usage**: Regularly check the "last used" timestamps
6. **Set Expiration**: Use expiration dates for temporary access

## Error Handling

**Unauthorized Request (401):**
\`\`\`json
{
  "success": false,
  "error": "Unauthorized. Valid secret key required."
}
\`\`\`

**Invalid Custom Field (500):**
\`\`\`json
{
  "success": false,
  "error": "Custom field with key 'invalid_key' not found"
}
\`\`\`

## Integration Examples

### JavaScript/TypeScript
\`\`\`typescript
const secretKey = process.env.SECRET_KEY

const response = await fetch('/api/bookings', {
  headers: {
    'x-secret-key': secretKey
  }
})

const data = await response.json()
if (data.success) {
  console.log('Bookings:', data.bookings)
} else {
  console.error('Error:', data.error)
}
\`\`\`

### Python
\`\`\`python
import os
import requests

secret_key = os.getenv('SECRET_KEY')

response = requests.get(
    'https://yourdomain.com/api/bookings',
    headers={'x-secret-key': secret_key}
)

if response.status_code == 200:
    data = response.json()
    if data['success']:
        print('Bookings:', data['bookings'])
    else:
        print('Error:', data['error'])
else:
    print('HTTP Error:', response.status_code)
\`\`\`

### cURL with Custom Field Filter
\`\`\`bash
#!/bin/bash

SECRET_KEY="sk_your_key_here"
BASE_URL="https://yourdomain.com/api/bookings"

# Get bookings by email
curl -H "x-secret-key: $SECRET_KEY" \
     "$BASE_URL?customKey=email&value=john@example.com"

# Get confirmed bookings by phone number
curl -H "x-secret-key: $SECRET_KEY" \
     "$BASE_URL?customKey=phone&value=1234567890&status=confirmed"
\`\`\`

## Database Schema

The secret keys are stored in the `secret_keys` table:

\`\`\`sql
CREATE TABLE secret_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Support

If you encounter any issues with the Secret Key Management system:

1. Check that your secret key is active and not expired
2. Verify the key is included correctly in your request
3. Ensure the custom field key exists and is active (for custom field filters)
4. Check the browser console or server logs for detailed error messages

For additional support, contact your system administrator.
