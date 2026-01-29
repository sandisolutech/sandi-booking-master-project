const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function updateCustomFieldsSchema() {
  try {
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('Updating custom_fields table schema...')
    
    try {
      // Drop the existing constraint and add the new one with all field types
      await sql`
        ALTER TABLE custom_fields 
        DROP CONSTRAINT IF EXISTS custom_fields_field_type_check
      `
      console.log('✓ Dropped old constraint')

      await sql`
        ALTER TABLE custom_fields 
        ADD CONSTRAINT custom_fields_field_type_check 
        CHECK (field_type IN (
          'text', 'number', 'email', 'password', 'tel', 'url', 'search',
          'date', 'time', 'datetime-local', 'month', 'week',
          'color', 'range', 'file', 'checkbox', 'radio',
          'textarea', 'select', 'multiple_select'
        ))
      `
      console.log('✓ Added new field type constraint')

      // Add new columns one by one
      const columnUpdates = [
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS min_value VARCHAR(50)',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS max_value VARCHAR(50)',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS step_value VARCHAR(50)',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS accept_types VARCHAR(255)',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS multiple_files BOOLEAN DEFAULT FALSE',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS max_length INTEGER',
        'ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS pattern VARCHAR(500)'
      ]

      for (const update of columnUpdates) {
        try {
          await sql.query(update)
          console.log(`✓ Executed: ${update}`)
        } catch (error) {
          console.log(`- Column may already exist: ${error.message}`)
        }
      }
      
    } catch (error) {
      console.error('✗ Error updating schema:', error.message)
      throw error
    }
    
    console.log('Custom fields schema update completed successfully!')
  } catch (error) {
    console.error('Schema update failed:', error)
    process.exit(1)
  }
}

updateCustomFieldsSchema()
