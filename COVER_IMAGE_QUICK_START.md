# Cover Image Feature - Quick Start Guide

## 🚀 Implementation Complete!

The cover image upload feature has been successfully implemented. Here's how to use it:

## 📍 Access Locations

### 1. **Admin Settings** (Upload Location)
   - **URL:** `http://localhost:3000/admin/settings`
   - **Tab:** "General" (first tab)
   - **Section:** "Cover Image" (scroll down to find it)
   - Located between Company Logo and Save Changes button

### 2. **Booking Page** (Display Location)
   - **URL:** `http://localhost:3000/register/77d6fdd4-c1b6-4b2f-abbd-422207446c20`
   - Cover image displays as a full-width banner at the top of the booking form

## 🎯 How to Use

### Upload Cover Image (Admin)

1. Go to `http://localhost:3000/admin/settings`
2. Stay on the "General" tab
3. Scroll down to the "Cover Image" section
4. You'll see a dashed border upload area with an Upload icon
5. Click the area or drag & drop an image file
7. **Supported formats:** PNG, JPG, GIF, SVG
8. **Max file size:** 512 KB
9. Image preview will show after upload
10. Click "Replace Image" to change or delete icon (🗑) to remove
11. Changes auto-save automatically

### View on Booking Page

1. After uploading a cover image in admin settings
2. Visit any booking link, e.g., `http://localhost:3000/register/77d6fdd4-c1b6-4b2f-abbd-422207446c20`
3. The cover image will display as a professional banner at the top
4. Fully responsive - looks great on all devices

## 🗄️ Database Setup

Before the feature can work, you need to add the database column:

\`\`\`bash
# Run this command to add the cover_image_url column to the database
node scripts/add-company-cover-image-url.mjs
\`\`\`

**What this does:**
- Adds `company_cover_image_url` column to the `general_config` table
- Column type: TEXT (for base64-encoded images)
- Safe to run multiple times (checks if column exists)

## 📋 Files Modified

### Backend/Database
- `app/admin/settings/actions.ts` - Updated GeneralConfig type and SQL queries
- `scripts/add-company-cover-image-url.sql` - Database migration SQL
- `scripts/add-company-cover-image-url.mjs` - Migration runner script

### Frontend - Admin Panel
- `app/admin/settings/page.tsx` - Added upload UI and handlers

### Frontend - Booking Page
- `app/register/[linkId]/page.tsx` - Added cover image display

## ✨ Features

**Upload Features:**
- ✅ Drag & drop support
- ✅ Click to browse
- ✅ Real-time image preview
- ✅ File type validation
- ✅ File size validation (512KB max)
- ✅ Replace or delete image
- ✅ Auto-save with notifications
- ✅ Loading state feedback

**Display Features:**
- ✅ Full-width responsive banner
- ✅ Professional appearance
- ✅ Mobile optimized
- ✅ Gracefully hidden when no image set
- ✅ Automatic cache clearing on update

## 🎨 Image Size Guidelines

The cover image displays with full width and flexible height. Upload any size or aspect ratio:
- **Landscape:** 1600×900px, 1920×1080px, 2100×900px (popular sizes)
- **Portrait:** 1080×1350px, 1000×1500px (will display full height)
- **Square:** 1000×1000px, 1500×1500px (displays as square)
- **Any custom size:** The image will scale to fit the full width

No aspect ratio restrictions - use whatever works best for your brand!

## 🐛 Troubleshooting

**Image not appearing after upload?**
- Check browser console for errors (F12 → Console)
- Verify file size is under 512KB
- Try refreshing the page
- Clear browser cache

**Upload button not working?**
- Ensure you're logged into admin panel
- Check that file format is supported (PNG, JPG, GIF, SVG)
- Verify file size

**Database error when running migration?**
- Ensure database connection is working
- Check environment variables in `.env.local`
- Make sure you have database permissions

## 📞 Support

For issues or questions about the implementation:
1. Check the `COVER_IMAGE_IMPLEMENTATION.md` file for technical details
2. Review error messages in browser console
3. Check database connection and migration status

---

**Ready to use!** Upload your cover image now and see it displayed on your booking page. 🎉
