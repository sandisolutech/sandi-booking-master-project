// Script to create comprehensive sample custom fields for demonstration
const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function createSampleFields() {
  try {
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('Creating comprehensive sample custom fields...')
    
    // Sample fields data with all supported types
    const sampleFields = [
      {
        title: 'Full Name',
        field_type: 'text',
        is_required: true,
        placeholder: 'Enter your full name',
        max_length: 100,
        order_index: 1
      },
      {
        title: 'Number of Attendees',
        field_type: 'number',
        is_required: true,
        placeholder: 'Expected number of attendees',
        min_value: '1',
        max_value: '500',
        step_value: '1',
        order_index: 2
      },
      {
        title: 'Contact Email',
        field_type: 'email',
        is_required: true,
        placeholder: 'your@email.com',
        order_index: 3
      },
      {
        title: 'Contact Phone',
        field_type: 'tel',
        is_required: false,
        placeholder: '+1 (555) 123-4567',
        pattern: '^[+]?[1-9]?[0-9]{7,15}$',
        order_index: 4
      },
      {
        title: 'Website URL',
        field_type: 'url',
        is_required: false,
        placeholder: 'https://yourcompany.com',
        order_index: 5
      },
      {
        title: 'Event Date',
        field_type: 'date',
        is_required: true,
        min_value: '2024-01-01',
        max_value: '2025-12-31',
        order_index: 6
      },
      {
        title: 'Preferred Start Time',
        field_type: 'time',
        is_required: false,
        min_value: '08:00',
        max_value: '18:00',
        order_index: 7
      },
      {
        title: 'Budget Range',
        field_type: 'range',
        is_required: false,
        min_value: '100',
        max_value: '10000',
        step_value: '100',
        order_index: 8
      },
      {
        title: 'Brand Color',
        field_type: 'color',
        is_required: false,
        order_index: 9
      },
      {
        title: 'Event Type',
        field_type: 'select',
        is_required: true,
        options: '["Meeting", "Conference", "Workshop", "Training", "Presentation", "Social Event", "Other"]',
        order_index: 10
      },
      {
        title: 'Required Equipment',
        field_type: 'multiple_select',
        is_required: false,
        options: '["Projector", "Microphone", "Speakers", "Whiteboard", "Video Conference Setup", "Catering", "WiFi", "Parking"]',
        order_index: 11
      },
      {
        title: 'Preferred Setup',
        field_type: 'radio',
        is_required: true,
        options: '["Theater Style", "Classroom", "U-Shape", "Boardroom", "Cocktail", "Banquet"]',
        order_index: 12
      },
      {
        title: 'Additional Services',
        field_type: 'checkbox',
        is_required: false,
        order_index: 13
      },
      {
        title: 'Special Requirements',
        field_type: 'textarea',
        is_required: false,
        placeholder: 'Please describe any special requirements, dietary restrictions, accessibility needs, etc.',
        max_length: 1000,
        order_index: 14
      },
      {
        title: 'Event Documents',
        field_type: 'file',
        is_required: false,
        accept_types: '.pdf,.doc,.docx,.ppt,.pptx',
        multiple_files: true,
        order_index: 15
      },
      {
        title: 'Password for Private Events',
        field_type: 'password',
        is_required: false,
        placeholder: 'Enter access password',
        min_length: 6,
        order_index: 16
      }
    ]
    
    for (let i = 0; i < sampleFields.length; i++) {
      const field = sampleFields[i]
      
      await sql`
        INSERT INTO custom_fields (
          title, field_type, is_required, placeholder, options, 
          min_value, max_value, step_value, accept_types, multiple_files,
          max_length, pattern, order_index
        )
        VALUES (
          ${field.title}, ${field.field_type}, ${field.is_required}, 
          ${field.placeholder || null}, ${field.options || null},
          ${field.min_value || null}, ${field.max_value || null}, ${field.step_value || null},
          ${field.accept_types || null}, ${field.multiple_files || false},
          ${field.max_length || null}, ${field.pattern || null}, ${field.order_index}
        )
      `
      
      console.log(`✓ Created field: ${field.title} (${field.field_type})`)
    }
    
    console.log('\n✅ All sample custom fields created successfully!')
    console.log('Fields created:')
    console.log('• Text inputs: Full Name')
    console.log('• Number input: Number of Attendees (with min/max/step)')
    console.log('• Email input: Contact Email')
    console.log('• Phone input: Contact Phone (with validation pattern)')
    console.log('• URL input: Website URL')
    console.log('• Date input: Event Date (with date range)')
    console.log('• Time input: Preferred Start Time')
    console.log('• Range slider: Budget Range')
    console.log('• Color picker: Brand Color')
    console.log('• Select dropdown: Event Type')
    console.log('• Multiple select: Required Equipment')
    console.log('• Radio buttons: Preferred Setup')
    console.log('• Checkbox: Additional Services')
    console.log('• Textarea: Special Requirements')
    console.log('• File upload: Event Documents (multiple files, specific types)')
    console.log('• Password: Password for Private Events')
    console.log('\nYou can view and manage them at: http://localhost:3002/admin/settings (Custom Fields tab)')
    
  } catch (error) {
    console.error('❌ Error creating sample fields:', error)
    process.exit(1)
  }
}

createSampleFields()
