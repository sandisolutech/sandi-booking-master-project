// Helper function to replace variables in LINE messages
export function replaceLINEMessageVariables(
  message: string,
  variables: {
    booking_number?: string
    company_name?: string
    date?: string
    time_slot?: string
    room_name?: string
    customer_name?: string
    booking_link?: string
    cancel_link?: string
    support_email?: string
  }
): string {
  let processedMessage = message
  
  // Replace each variable if it exists
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const placeholder = `{{${key}}}`
      processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value)
    }
  })
  
  // Clean up any remaining empty placeholders (for variables that weren't provided)
  processedMessage = processedMessage.replace(/\{\{[^}]+\}\}/g, '[Not Available]')
  
  return processedMessage
}

// Available variables for LINE messages
export const LINE_MESSAGE_VARIABLES = {
  '{{booking_number}}': 'The booking confirmation number',
  '{{company_name}}': 'Name of the company being booked',
  '{{date}}': 'The booking date (formatted)',
  '{{time_slot}}': 'The time slot (e.g., 09:00 - 10:00)',
  '{{room_name}}': 'Name of the booked room',
  '{{customer_name}}': 'Customer name from custom fields',
  '{{booking_link}}': 'Link to view booking details (can be used as general "link")',
  '{{cancel_link}}': 'Link to cancel the booking (same as booking_link)',
  '{{support_email}}': 'Company support email',
} as const
