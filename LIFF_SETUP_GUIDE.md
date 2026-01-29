# LINE LIFF Integration Setup Guide

This guide will help you integrate LINE LIFF (LINE Front-end Framework) into your booking system for customer-facing features.

## 🚀 Quick Setup

### 1. Install LIFF SDK
\`\`\`bash
npm install @line/liff
\`\`\`

### 2. Environment Configuration
Create or update your `.env.local` file:
\`\`\`env
# LINE LIFF Configuration
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
\`\`\`

### 3. Get Your LIFF ID
1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider or select an existing one
3. Create a new channel (LINE Login)
4. Go to the LIFF tab
5. Add a new LIFF app with these settings:
   - **LIFF app name**: Your Booking System
   - **Size**: Full
   - **Endpoint URL**: https://yourdomain.com/register/[linkId]
   - **Scope**: profile, openid
   - **Bot link feature**: Optional

## 🎯 What's Included

### LIFF Features for Customers:
- ✅ Automatic user login via LINE account
- ✅ LINE profile integration (name, photo)
- ✅ Send booking confirmation to LINE chat
- ✅ Mobile-optimized UI for LINE browser
- ✅ Share booking links via LINE

### Admin Features Unchanged:
- ✅ Regular web interface for admin panel
- ✅ No LINE dependency for management tasks
- ✅ Full desktop experience maintained

## 📱 Customer Experience

### When users access booking links:
1. **Outside LINE app**: Works as normal web app
2. **Inside LINE app**: 
   - Shows LINE user profile at top
   - Auto-fills user information when available
   - Sends confirmation message to LINE chat after booking
   - Optimized mobile interface

## 🔧 Implementation Details

### Files Created/Modified:
- `hooks/use-liff.ts` - LIFF integration hook
- `components/liff-layout.tsx` - LIFF-aware layout component
- `styles/liff.css` - Mobile-optimized styles
- `app/register/[linkId]/page.tsx` - Updated with LIFF integration

### Key Features:
1. **Automatic Detection**: Detects if user is in LINE app
2. **Progressive Enhancement**: Works without LINE, better with LINE
3. **Error Handling**: Graceful fallback if LIFF fails
4. **Mobile First**: Optimized for mobile devices

## 🛠️ Manual Integration Steps

If you want to manually integrate LIFF into your existing booking page:

### 1. Update your booking page component:

\`\`\`tsx
import { useLiff } from "@/hooks/use-liff"
import { LiffLayout } from "@/components/liff-layout"

export default function BookingPage() {
  // Add LIFF integration
  const { 
    isLoggedIn: isLiffLoggedIn, 
    isInClient: isLiffInClient, 
    profile: liffProfile, 
    sendMessage 
  } = useLiff()

  // Your existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    // Your existing submission logic...
    
    if (result.success) {
      // Send confirmation to LINE if user is in LINE app
      if (isLiffInClient && isLiffLoggedIn) {
        try {
          const message = `🎉 Booking Confirmed!\n\nBooking #: ${result.bookingNumber}\nThank you!`
          await sendMessage(message)
        } catch (error) {
          console.log("Could not send LINE message:", error)
        }
      }
      
      router.push(`/booking/${result.bookingNumber}`)
    }
  }

  // Wrap your return with LiffLayout
  return (
    <LiffLayout showProfile={isLiffInClient && isLiffLoggedIn}>
      {/* Your existing JSX */}
    </LiffLayout>
  )
}
\`\`\`

## 🔍 Testing

### Development Testing:
1. Use LINE App on mobile device
2. Send your development URL to LINE chat
3. Open the link from within LINE app
4. Test booking flow

### Production Deployment:
1. Update LIFF endpoint URL to production domain
2. Test on both mobile and desktop
3. Verify LINE integration works correctly

## 📋 Checklist

- [ ] LIFF SDK installed
- [ ] Environment variables configured
- [ ] LIFF app created in LINE Developers Console
- [ ] Booking page updated with LIFF integration
- [ ] Mobile responsive design tested
- [ ] LINE message sending tested
- [ ] Admin panel remains unchanged

## 🎯 Benefits

### For Customers:
- **Seamless Experience**: No additional login required in LINE
- **Native Feel**: Integrated with LINE ecosystem
- **Instant Notifications**: Booking confirmations sent to LINE
- **Mobile Optimized**: Perfect for mobile booking

### For Business:
- **Increased Conversions**: Easier booking process
- **Customer Engagement**: Direct LINE communication
- **Brand Integration**: Professional LINE presence
- **Analytics**: Track bookings from LINE users

## 🚨 Important Notes

1. **LIFF ID Security**: Keep your LIFF ID public (it's meant to be)
2. **HTTPS Required**: LIFF only works with HTTPS URLs
3. **Testing**: Always test in actual LINE app, not browser
4. **Fallback**: Ensure app works without LIFF for web users

## 📞 Support

If you need help with LIFF integration:
1. Check [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
2. Test in LINE App Browser Simulator
3. Verify LIFF configuration in LINE Developers Console

---

Your booking system now supports both regular web users and LINE users with an enhanced mobile experience! 🎉
