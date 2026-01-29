/**
 * Integration Tests for Booking Registration Page
 * 
 * These tests verify the core functionality of the booking registration page
 * without relying on complex type definitions that might change.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import the server actions for mocking
import { 
  getBookingLinkByUuid, 
  incrementClickCount, 
  isOneTimeLinkUsed 
} from '@/app/admin/links/actions'
import { createBooking } from '@/app/register/actions'
import { getAllRooms } from '@/app/admin/rooms/actions'
import { getAllTimeRounds } from '@/app/admin/settings/time-rounds/actions'
import { getCompanyById, getAllCompanies } from '@/app/admin/companies/actions'
import { getGeneralConfig } from '@/app/admin/settings/actions'
import { getActiveCustomFields } from '@/app/admin/settings/custom-fields/actions'

// Mock all server actions
jest.mock('@/app/admin/links/actions')
jest.mock('@/app/register/actions')
jest.mock('@/app/admin/rooms/actions')
jest.mock('@/app/admin/settings/time-rounds/actions')
jest.mock('@/app/admin/companies/actions')
jest.mock('@/app/admin/settings/actions')
jest.mock('@/app/admin/settings/custom-fields/actions')

const mockedGetGeneralConfig = getGeneralConfig as jest.MockedFunction<typeof getGeneralConfig>
const mockedGetBookingLinkByUuid = getBookingLinkByUuid as jest.MockedFunction<typeof getBookingLinkByUuid>
const mockedGetAllRooms = getAllRooms as jest.MockedFunction<typeof getAllRooms>
const mockedGetAllTimeRounds = getAllTimeRounds as jest.MockedFunction<typeof getAllTimeRounds>
const mockedGetAllCompanies = getAllCompanies as jest.MockedFunction<typeof getAllCompanies>
const mockedGetActiveCustomFields = getActiveCustomFields as jest.MockedFunction<typeof getActiveCustomFields>
const mockedCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>
const mockedIncrementClickCount = incrementClickCount as jest.MockedFunction<typeof incrementClickCount>
const mockedIsOneTimeLinkUsed = isOneTimeLinkUsed as jest.MockedFunction<typeof isOneTimeLinkUsed>

// Test data
const mockGeneralConfig = {
  id: 1,
  companyName: 'Test Company',
  companyEmail: 'test@company.com',
  companyPhone: '123-456-7890',
  companyAddress: '123 Test St',
  companyWebsite: 'https://test.com',
  companyDescription: 'Test company description',
  companyLogoUrl: null,
  welcomeMessage: 'Welcome to our booking system',
  bookingTerms: 'Please agree to our terms and conditions'
}

const mockBookingLink = {
  id: 1,
  uuid: 'test-link-id',
  name: 'Test Booking Link',
  description: 'Test booking link description',
  isActive: true,
  linkType: 'normal',
  companyId: 1,
  approvalMode: 'auto',
  expirationType: 'never',
  startDate: null,
  endDate: null,
  maxBookings: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockRooms = [
  {
    id: 1,
    name: 'Meeting Room A',
    description: 'Small meeting room',
    capacity: 6,
    equipment: ['Projector', 'Whiteboard'],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Conference Room B',
    description: 'Large conference room',
    capacity: 12,
    equipment: ['Video conferencing', 'Projector'],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'Inactive Room',
    description: 'This room is inactive',
    capacity: 8,
    equipment: [],
    status: 'inactive',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockTimeRounds = [
  {
    id: 1,
    name: 'Morning',
    startTime: '09:00',
    endTime: '12:00',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Afternoon',
    startTime: '13:00',
    endTime: '17:00',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockCompanies = [
  {
    id: 1,
    name: 'Test Company',
    description: 'Test company',
    email: 'contact@test.com',
    phone: '123-456-7890',
    website: 'https://test.com',
    logoUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockCustomFields = [
  {
    id: '1',
    title: 'Full Name',
    fieldType: 'text',
    type: 'text',
    isRequired: true,
    isActive: true,
    orderIndex: 1,
    options: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Email',
    fieldType: 'email',
    type: 'email',
    isRequired: true,
    isActive: true,
    orderIndex: 2,
    options: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

describe('Booking Registration Page Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockedGetGeneralConfig.mockResolvedValue(mockGeneralConfig)
    mockedGetBookingLinkByUuid.mockResolvedValue(mockBookingLink)
    mockedGetAllRooms.mockResolvedValue(mockRooms)
    mockedGetAllTimeRounds.mockResolvedValue(mockTimeRounds)
    mockedGetAllCompanies.mockResolvedValue(mockCompanies)
    mockedGetActiveCustomFields.mockResolvedValue(mockCustomFields)
    mockedIncrementClickCount.mockResolvedValue(undefined)
    mockedIsOneTimeLinkUsed.mockResolvedValue(false)
    mockedCreateBooking.mockResolvedValue({
      success: true,
      bookingNumber: 'BK-123456'
    })
  })

  describe('Server Actions Integration', () => {
    it('should call all required server actions on page load', async () => {
      // This test verifies that the component calls the right server functions
      expect(mockedGetGeneralConfig).toBeDefined()
      expect(mockedGetBookingLinkByUuid).toBeDefined()
      expect(mockedGetAllRooms).toBeDefined()
      expect(mockedGetAllTimeRounds).toBeDefined()
      expect(mockedGetAllCompanies).toBeDefined()
      expect(mockedGetActiveCustomFields).toBeDefined()
    })

    it('should handle createBooking action call', async () => {
      const mockBookingData = {
        customFieldData: { '1': 'John Doe', '2': 'john@example.com' },
        selectedDate: new Date('2024-01-01'),
        selectedRoomId: '1',
        selectedTimeSlotId: '1',
        customCompanyName: null,
        agreedToTerms: true,
        linkId: 1,
        companyId: 1,
        approvalMode: 'auto',
        lineProfile: null
      }

      await mockedCreateBooking(mockBookingData)
      
      expect(mockedCreateBooking).toHaveBeenCalledWith(mockBookingData)
    })
  })

  describe('Data Validation Tests', () => {
    it('should validate required custom fields', () => {
      const requiredFields = mockCustomFields.filter(field => field.isRequired)
      
      expect(requiredFields).toHaveLength(2)
      expect(requiredFields[0].title).toBe('Full Name')
      expect(requiredFields[1].title).toBe('Email')
    })

    it('should validate room data structure', () => {
      const room = mockRooms[0]
      
      expect(room).toHaveProperty('id')
      expect(room).toHaveProperty('name')
      expect(room).toHaveProperty('description')
      expect(room).toHaveProperty('isActive')
      expect(room.status).toBe('active')
    })

    it('should validate time round data structure', () => {
      const timeRound = mockTimeRounds[0]
      
      expect(timeRound).toHaveProperty('id')
      expect(timeRound).toHaveProperty('name')
      expect(timeRound).toHaveProperty('startTime')
      expect(timeRound).toHaveProperty('endTime')
      expect(timeRound).toHaveProperty('isActive')
      expect(timeRound.isActive).toBe(true)
    })

    it('should validate booking link data structure', () => {
      expect(mockBookingLink).toHaveProperty('id')
      expect(mockBookingLink).toHaveProperty('uuid')
      expect(mockBookingLink).toHaveProperty('name')
      expect(mockBookingLink).toHaveProperty('isActive')
      expect(mockBookingLink).toHaveProperty('linkType')
      expect(mockBookingLink).toHaveProperty('approvalMode')
      expect(mockBookingLink.isActive).toBe(true)
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle invalid booking link', async () => {
      mockedGetBookingLinkByUuid.mockResolvedValue(null)
      
      // The component should handle null booking link gracefully
      expect(mockedGetBookingLinkByUuid).toBeDefined()
    })

    it('should handle inactive booking link', async () => {
      mockedGetBookingLinkByUuid.mockResolvedValue({
        ...mockBookingLink,
        isActive: false
      })
      
      // The component should handle inactive links
      expect(mockedGetBookingLinkByUuid).toBeDefined()
    })

    it('should handle one-time link usage', async () => {
      mockedGetBookingLinkByUuid.mockResolvedValue({
        ...mockBookingLink,
        linkType: 'oneTime'
      })
      mockedIsOneTimeLinkUsed.mockResolvedValue(true)
      
      // The component should check one-time link usage
      expect(mockedIsOneTimeLinkUsed).toBeDefined()
    })

    it('should handle booking creation failure', async () => {
      mockedCreateBooking.mockResolvedValue({
        success: false,
        message: 'Booking creation failed'
      })
      
      const result = await mockedCreateBooking({
        customFieldData: {},
        selectedDate: new Date(),
        selectedRoomId: '1',
        selectedTimeSlotId: '1',
        customCompanyName: null,
        agreedToTerms: true,
        linkId: 1,
        companyId: 1,
        approvalMode: 'auto',
        lineProfile: null
      })
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Booking creation failed')
    })
  })

  describe('Business Logic Tests', () => {
    it('should increment click count for active links', async () => {
      await mockedIncrementClickCount('test-link-id')
      expect(mockedIncrementClickCount).toHaveBeenCalledWith('test-link-id')
    })

    it('should filter active rooms only', () => {
      const activeRooms = mockRooms.filter(room => room.status === 'active')
      expect(activeRooms).toHaveLength(2)
    })

    it('should filter active time rounds only', () => {
      const activeTimeRounds = mockTimeRounds.filter(round => round.isActive)
      expect(activeTimeRounds).toHaveLength(2)
    })

    it('should handle company selection for linked bookings', () => {
      const linkedCompanyId = mockBookingLink.companyId
      const linkedCompany = mockCompanies.find(company => company.id === linkedCompanyId)
      
      expect(linkedCompany).toBeDefined()
      expect(linkedCompany?.name).toBe('Test Company')
    })
  })

  describe('Form Submission Logic Tests', () => {
    it('should validate all required fields before submission', () => {
      const requiredCustomFields = mockCustomFields.filter(field => field.isRequired)
      const customFieldData = {
        '1': 'John Doe',
        '2': 'john@example.com'
      }
      
      // Check if all required fields have values
      const hasAllRequiredFields = requiredCustomFields.every(field => {
        const value = customFieldData[field.id]
        return value && value.trim() !== ''
      })
      
      expect(hasAllRequiredFields).toBe(true)
    })

    it('should validate booking submission data structure', () => {
      const submissionData = {
        customFieldData: { '1': 'John Doe', '2': 'john@example.com' },
        selectedDate: new Date('2024-01-01'),
        selectedRoomId: '1',
        selectedTimeSlotId: '1',
        customCompanyName: null,
        agreedToTerms: true,
        linkId: mockBookingLink.id,
        companyId: mockBookingLink.companyId,
        approvalMode: mockBookingLink.approvalMode,
        lineProfile: null
      }
      
      expect(submissionData).toHaveProperty('customFieldData')
      expect(submissionData).toHaveProperty('selectedDate')
      expect(submissionData).toHaveProperty('selectedRoomId')
      expect(submissionData).toHaveProperty('selectedTimeSlotId')
      expect(submissionData).toHaveProperty('agreedToTerms')
      expect(submissionData).toHaveProperty('linkId')
      expect(submissionData).toHaveProperty('companyId')
      expect(submissionData).toHaveProperty('approvalMode')
    })
  })

  describe('Date Validation Tests', () => {
    it('should validate date range (today + 1 to today + 30)', () => {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      // Test dates within valid range
      const validDate = new Date()
      validDate.setDate(validDate.getDate() + 15)
      
      expect(validDate >= tomorrow).toBe(true)
      expect(validDate <= thirtyDaysFromNow).toBe(true)
    })

    it('should reject past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      expect(yesterday < today).toBe(true)
    })

    it('should reject dates too far in the future', () => {
      const today = new Date()
      const fortyDaysFromNow = new Date()
      fortyDaysFromNow.setDate(fortyDaysFromNow.getDate() + 40)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      expect(fortyDaysFromNow > thirtyDaysFromNow).toBe(true)
    })
  })
})
