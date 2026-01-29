# Company Logo Database Integration

This update implements a complete system to display company logos from the database across all pages of the website.

## What Was Changed

### 🗄️ **Database Functions Added**
- `getCompanyLogo()` - Fetches just the logo URL from database
- `getCompanyBranding()` - Fetches name, logo, and description together

### 🎨 **New Components Created**

#### `CompanyLogo` Component (`/components/company-logo.tsx`)
- **Reusable logo component** with multiple size options
- **Smart fallback system** - shows company initial if no logo
- **Base64 and URL support** - handles both base64 images and external URLs
- **Error handling** - gracefully falls back to text if image fails
- **Props**:
  - `size`: "sm" | "md" | "lg" | "xl"
  - `showCompanyName`: boolean
  - `className`: custom styling
  - `fallbackText`: custom fallback text

#### `useCompanyBranding` Hook (`/hooks/use-company-branding.ts`)
- **Performance optimized** with global caching
- **Prevents duplicate API calls** across components
- **Cache invalidation** after logo updates
- **Preload functionality** for early loading

### 📱 **Pages Updated**

All major pages now display the company logo from the database:

1. **Admin Sidebar** (`/components/admin-sidebar.tsx`)
   - Logo with company name in header

2. **Dashboard Header** (`/components/dashboard-header.tsx`)
   - Small logo next to page title

3. **Login Page** (`/app/login/page.tsx`)
   - Logo with company name in header

4. **Main Homepage** (`/app/page.tsx`)
   - Logo with company name in navigation

5. **Booking Registration** (`/app/register/[linkId]/page.tsx`)
   - Logo displayed prominently in booking form

6. **Booking Success Page** (`/app/register/[linkId]/success/page.tsx`)
   - Logo in header with language toggle

7. **Booking Details** (`/app/booking/[booking_number]/page.tsx`)
   - Logo in booking confirmation card

8. **My Bookings** (`/app/my-bookings/page.tsx`)
   - Logo next to page title

### 🔄 **Cache Management**

- **Global caching** prevents repeated database calls
- **Automatic invalidation** when logo is updated in settings
- **Smart loading states** with skeleton placeholders

## Usage Examples

### Basic Logo Display
\`\`\`tsx
<CompanyLogo size="md" />
\`\`\`

### Logo with Company Name
\`\`\`tsx
<CompanyLogo size="lg" showCompanyName />
\`\`\`

### Custom Styling
\`\`\`tsx
<CompanyLogo 
  size="sm" 
  className="border-2 border-blue-500" 
  fallbackClassName="bg-red-500"
/>
\`\`\`

## Features

### ✅ **Smart Fallback System**
- Shows company name initial if no logo uploaded
- Handles broken image URLs gracefully
- Maintains consistent branding

### ✅ **Performance Optimized**
- Global caching prevents duplicate API calls
- Skeleton loading states
- Preload capability for faster initial loads

### ✅ **Responsive Design**
- Multiple size variants for different contexts
- Consistent styling across all components
- Mobile-friendly implementation

### ✅ **Error Handling**
- Graceful fallbacks for missing images
- Network error handling
- Default company name fallback

## Technical Implementation

### Database Schema
The logo is stored in the `general_config` table:
\`\`\`sql
company_logo_url TEXT -- Supports both base64 and URLs
\`\`\`

### Caching Strategy
\`\`\`typescript
// Global cache with smart loading
let cachedBranding: CompanyBranding | null = null
let loadingPromise: Promise<CompanyBranding> | null = null
\`\`\`

### Cache Invalidation
\`\`\`typescript
// Called after logo updates in settings
invalidateCompanyBrandingCache()
\`\`\`

## Before/After

### Before ❌
- Hardcoded placeholder logos
- Static company names
- No centralized branding

### After ✅
- Dynamic logos from database
- Consistent branding across all pages
- Automatic updates when logo changes
- Performance optimized with caching
- Graceful fallbacks and error handling

## Migration Required

Make sure to run the database migration:
\`\`\`sql
ALTER TABLE general_config ALTER COLUMN company_logo_url TYPE TEXT;
\`\`\`

This allows storing base64 encoded images in addition to URLs.

## Testing

1. Upload a logo in Admin Settings → General
2. Verify logo appears on all pages
3. Remove logo and verify fallback text appears
4. Test with different image formats (PNG, JPG, SVG)
5. Test error handling with broken URLs
