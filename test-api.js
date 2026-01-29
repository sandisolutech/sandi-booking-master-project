#!/usr/bin/env node

// Simple test script to verify API implementation
const BASE_URL = 'http://localhost:3000/api'

// Test cases for the booking API
const testCases = [
  {
    name: 'Test unauthorized access',
    url: `${BASE_URL}/bookings`,
    headers: {},
    expectedStatus: 401
  },
  {
    name: 'Test with invalid secret key',
    url: `${BASE_URL}/bookings`,
    headers: { 'x-secret-key': 'invalid_key' },
    expectedStatus: 401
  },
  {
    name: 'Test basic fetch (needs valid secret key)',
    url: `${BASE_URL}/bookings?page=1&pageSize=5`,
    headers: { 'x-secret-key': 'sk_test_your_key_here' },
    expectedStatus: 200,
    note: 'This will fail until you have a valid secret key'
  },
  {
    name: 'Test custom field filtering (needs valid secret key)',
    url: `${BASE_URL}/bookings?customKey=email&value=test@example.com&page=1&pageSize=10`,
    headers: { 'x-secret-key': 'sk_test_your_key_here' },
    expectedStatus: 200,
    note: 'This will fail until you have a valid secret key'
  },
  {
    name: 'Test multiple filters (needs valid secret key)',
    url: `${BASE_URL}/bookings?status=confirmed&startDate=2024-01-01&endDate=2024-12-31&companyId=1&page=1&pageSize=10`,
    headers: { 'x-secret-key': 'sk_test_your_key_here' },
    expectedStatus: 200,
    note: 'This will fail until you have a valid secret key'
  }
]

async function runTests() {
  console.log('🧪 Testing Booking API Implementation\n')
  
  for (const test of testCases) {
    console.log(`📋 ${test.name}`)
    console.log(`   URL: ${test.url}`)
    
    try {
      const response = await fetch(test.url, {
        method: 'GET',
        headers: test.headers
      })
      
      const status = response.status
      const isExpectedStatus = status === test.expectedStatus
      
      console.log(`   Status: ${status} ${isExpectedStatus ? '✅' : '❌'} (expected ${test.expectedStatus})`)
      
      if (test.note) {
        console.log(`   Note: ${test.note}`)
      }
      
      // For successful responses, show basic structure
      if (status === 200) {
        try {
          const data = await response.json()
          console.log(`   Response structure: {`)
          console.log(`     success: ${data.success}`)
          console.log(`     bookings: ${Array.isArray(data.bookings) ? `array[${data.bookings.length}]` : 'not array'}`)
          console.log(`     totalCount: ${data.totalCount}`)
          console.log(`     page: ${data.page}`)
          console.log(`     pageSize: ${data.pageSize}`)
          console.log(`   }`)
        } catch (e) {
          console.log(`   Could not parse JSON response`)
        }
      } else if (status === 401) {
        try {
          const data = await response.json()
          console.log(`   Error: ${data.error}`)
        } catch (e) {
          console.log(`   Could not parse error response`)
        }
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`)
    }
    
    console.log()
  }
  
  console.log('🎯 Test Summary:')
  console.log('   - All unauthorized requests should return 401 status')
  console.log('   - Requests with valid secret keys should return 200 status')
  console.log('   - Response should include: success, bookings, totalCount, page, pageSize')
  console.log('   - Custom field filtering should work with customKey and value parameters')
  console.log('   - Standard filters should work: status, startDate, endDate, companyId, roomId')
  console.log('')
  console.log('💡 To create a valid secret key:')
  console.log('   1. Go to http://localhost:3000/admin/settings/secret-keys')
  console.log('   2. Create a new secret key')
  console.log('   3. Replace "sk_test_your_key_here" with your actual key in the tests')
}

runTests().catch(console.error)
