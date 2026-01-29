const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

async function runCustomFieldsMigration() {
  try {
    // Initialize the database connection
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('Creating custom_fields table...')
    
    try {
      // Create the table
      await sql`
        CREATE TABLE IF NOT EXISTS custom_fields (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'phone', 'multiple_select', 'dropdown')),
          is_required BOOLEAN DEFAULT FALSE,
          placeholder VARCHAR(255),
          options TEXT,
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✓ Custom fields table created!')

      // Create index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_custom_fields_active_order ON custom_fields(is_active, order_index)
      `
      console.log('✓ Index created!')

      // Create trigger function
      await sql`
        CREATE OR REPLACE FUNCTION update_custom_fields_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `
      console.log('✓ Trigger function created!')

      // Create trigger
      await sql`
        CREATE TRIGGER update_custom_fields_updated_at
          BEFORE UPDATE ON custom_fields
          FOR EACH ROW
          EXECUTE FUNCTION update_custom_fields_updated_at()
      `
      console.log('✓ Trigger created!')
      
    } catch (error) {
      console.error('✗ Error creating custom fields table:', error.message)
      throw error
    }
    
    console.log('Custom fields migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runCustomFieldsMigration()
