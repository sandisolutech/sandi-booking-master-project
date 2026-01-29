# Company Logo Upload Feature

This feature allows administrators to upload and manage company logos in the admin settings panel. The logo is converted to base64 format and stored directly in the database.

## Features

- **File Upload**: Support for PNG, JPG, GIF, and SVG image formats
- **Base64 Storage**: Images are converted to base64 and stored in the database
- **File Size Validation**: Maximum 512KB file size limit
- **Real-time Preview**: Logo is displayed immediately after upload
- **Logo Removal**: Option to remove existing logo
- **Auto-save**: Logo is automatically saved after upload

## Technical Implementation

### Database Changes

The `company_logo_url` column in the `general_config` table has been modified to support TEXT data type instead of VARCHAR(255) to accommodate base64 encoded images.

\`\`\`sql
ALTER TABLE general_config ALTER COLUMN company_logo_url TYPE TEXT;
\`\`\`

### Frontend Implementation

1. **File Input**: Hidden file input with image type restriction
2. **FileReader API**: Converts uploaded file to base64 format
3. **Validation**: File type and size validation before processing
4. **State Management**: Real-time state updates for upload progress
5. **Error Handling**: User-friendly error messages for various scenarios

### Usage

1. Navigate to Admin Settings → General tab
2. Click "Upload New" button in the Company Logo section  
3. Select an image file (PNG, JPG, GIF, SVG)
4. The logo will be automatically uploaded and saved
5. Use the trash icon to remove the logo if needed

### Code Structure

- **Upload Handler**: `handleLogoUpload()` - Processes file upload and base64 conversion
- **Remove Handler**: `handleLogoRemove()` - Removes existing logo
- **Validation**: File type and size validation
- **Display Logic**: Shows base64 images or fallback letter avatar

### File Size and Format Restrictions

- **Maximum Size**: 512KB per image
- **Supported Formats**: PNG, JPG, JPEG, GIF, SVG
- **Validation**: Client-side validation before upload

### Storage

- **Format**: Base64 encoded string
- **Location**: `general_config.company_logo_url` column
- **Type**: TEXT (supports large base64 strings)

## Migration

Run the migration script to update your database:

\`\`\`bash
./scripts/run-logo-migration.sh
\`\`\`

Or execute the SQL directly:

\`\`\`sql
ALTER TABLE general_config ALTER COLUMN company_logo_url TYPE TEXT;
\`\`\`

## Notes

- Base64 encoding increases file size by approximately 33%
- Consider using external storage (S3, CloudFront) for larger deployments
- The feature includes proper error handling and user feedback
- Logo is displayed in various parts of the application where company branding is shown
