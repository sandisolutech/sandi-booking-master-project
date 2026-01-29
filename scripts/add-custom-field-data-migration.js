/**
 * Migration script to add custom_field_data column to bookings table
 * This column will store JSON data of custom field values
 */

const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('Adding custom_field_data column to bookings table...');
    
    // Add the custom_field_data column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS custom_field_data JSON
    `;
    
    // Set default empty object for existing records
    await sql`
      UPDATE bookings 
      SET custom_field_data = '{}' 
      WHERE custom_field_data IS NULL
    `;
    
    console.log('✅ Successfully added custom_field_data column to bookings table');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
