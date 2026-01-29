/**
 * Migration script to add custom_field_data column to bookings table
 * Uses the same pattern as the existing codebase
 */

import { sql } from '../lib/db.js';

async function runMigration() {
  try {
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

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
