// Test script to verify custom fields functionality
const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function testCustomFields() {
  try {
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('Testing custom fields functionality...')
    
    // Test 1: Insert a test custom field
    console.log('\n1. Creating test custom field...')
    const result = await sql`
      INSERT INTO custom_fields (title, field_type, is_required, placeholder, options, order_index)
      VALUES ('Test Field', 'text', true, 'Enter your test value', NULL, 1)
      RETURNING *
    `
    
    const insertedField = Array.isArray(result) ? result[0] : result.rows?.[0]
    console.log('✓ Test field created:', insertedField)
    
    // Test 2: Query all custom fields
    console.log('\n2. Querying all custom fields...')
    const allFields = await sql`
      SELECT * FROM custom_fields ORDER BY order_index ASC
    `
    console.log('✓ Found fields:', Array.isArray(allFields) ? allFields.length : allFields.rows?.length || 0)
    
    // Test 3: Update the test field
    console.log('\n3. Updating test field...')
    await sql`
      UPDATE custom_fields 
      SET title = 'Updated Test Field', is_required = false
      WHERE id = ${insertedField.id}
    `
    console.log('✓ Test field updated')
    
    // Test 4: Create a dropdown field with options
    console.log('\n4. Creating dropdown field with options...')
    const dropdownResult = await sql`
      INSERT INTO custom_fields (title, field_type, is_required, options, order_index)
      VALUES ('Test Dropdown', 'dropdown', false, '["Option 1", "Option 2", "Option 3"]', 2)
      RETURNING *
    `
    
    const dropdownField = Array.isArray(dropdownResult) ? dropdownResult[0] : dropdownResult.rows?.[0]
    console.log('✓ Dropdown field created:', dropdownField)
    
    // Test 5: Clean up - delete test fields
    console.log('\n5. Cleaning up test data...')
    await sql`DELETE FROM custom_fields WHERE id IN (${insertedField.id}, ${dropdownField.id})`
    console.log('✓ Test data cleaned up')
    
    console.log('\n✅ All tests passed! Custom fields functionality is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testCustomFields()
