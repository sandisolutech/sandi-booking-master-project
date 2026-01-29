import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingPage from '@/app/register/[linkId]/page'

// Mock the server actions
jest.mock('@/app/admin/links/actions')
jest.mock('@/app/register/actions')
jest.mock('@/app/admin/rooms/actions')
jest.mock('@/app/admin/settings/time-rounds/actions')
jest.mock('@/app/admin/companies/actions')
jest.mock('@/app/admin/settings/actions')
jest.mock('@/app/admin/settings/custom-fields/actions')

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

const mockBookingLink = {
  id: 1,
  uuid: 'test-link-id',
  name: 'Test Booking Link',
  isActive: true,
  linkType: 'normal',
  companyId: 1,
  approvalMode: 'auto'
}

const mockCompanySettings = {
  id: 1,
  companyName: 'Test Company',
  welcomeMessage: 'Welcome to our booking system',
  bookingTerms: 'Please agree to our terms',
  supportEmail: 'support@test.com',
  companyPhone: '123-456-7890',
  companyWebsite: 'https://test.com'
}

const mockRooms = [
  {
    id: 1,
    name: 'Meeting Room A',
    description: 'Small meeting room',
    isActive: true
  },
  {
    id: 2,
    name: 'Conference Room B',
    description: 'Large conference room',
    isActive: true
  }
]

const mockTimeRounds = [
  {
    id: 1,
    name: 'Morning',
    startTime: '09:00',
    endTime: '12:00',
    isActive: true
  },
  {
    id: 2,
    name: 'Afternoon',
    startTime: '13:00',
    endTime: '17:00',
    isActive: true
  }
]

const mockCompanies = [
  {
    id: 1,
    name: 'Test Company'
  },
  {
    id: 2,
    name: 'Another Company'
  }
]

const mockCustomFields = [
  {
    id: '1',
    title: 'Full Name',
    type: 'text',
    isRequired: true,
    options: null
  },
  {
    id: '2',
    title: 'Email',
    type: 'email',
    isRequired: true,
    options: null
  }
]

// Mock implementations
const mockGetGeneralConfig = getGeneralConfig as jest.MockedFunction<typeof getGeneralConfig>
const mockGetBookingLinkByUuid = getBookingLinkByUuid as jest.MockedFunction<typeof getBookingLinkByUuid>
const mockGetAllRooms = getAllRooms as jest.MockedFunction<typeof getAllRooms>
const mockGetAllTimeRounds = getAllTimeRounds as jest.MockedFunction<typeof getAllTimeRounds>
const mockGetAllCompanies = getAllCompanies as jest.MockedFunction<typeof getAllCompanies>
const mockGetActiveCustomFields = getActiveCustomFields as jest.MockedFunction<typeof getActiveCustomFields>
const mockCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>
const mockIncrementClickCount = incrementClickCount as jest.MockedFunction<typeof incrementClickCount>
const mockIsOneTimeLinkUsed = isOneTimeLinkUsed as jest.MockedFunction<typeof isOneTimeLinkUsed>

describe('BookingPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockGetGeneralConfig.mockResolvedValue(mockCompanySettings)
    mockGetBookingLinkByUuid.mockResolvedValue(mockBookingLink)
    mockGetAllRooms.mockResolvedValue(mockRooms)
    mockGetAllTimeRounds.mockResolvedValue(mockTimeRounds)
    mockGetAllCompanies.mockResolvedValue(mockCompanies)
    mockGetActiveCustomFields.mockResolvedValue(mockCustomFields)
    mockIncrementClickCount.mockResolvedValue(undefined)
    mockIsOneTimeLinkUsed.mockResolvedValue(false)
  })

  describe('Loading States', () => {
    it('should show loading spinner while data is being fetched', () => {
      // Mock slow loading
      mockGetGeneralConfig.mockImplementation(() => new Promise(() => {}))
      
      render(<BookingPage />)
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should show content after data is loaded', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Company')).toBeInTheDocument()
        expect(screen.getByText('Test Booking Link')).toBeInTheDocument()
      })
    })
  })

  describe('Invalid Link Handling', () => {
    it('should show invalid link message when link is not found', async () => {
      mockGetBookingLinkByUuid.mockResolvedValue(null)
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid Link')).toBeInTheDocument()
        expect(screen.getByText('Link has expired')).toBeInTheDocument()
      })
    })

    it('should show invalid link message when link is inactive', async () => {
      mockGetBookingLinkByUuid.mockResolvedValue({
        ...mockBookingLink,
        isActive: false
      })
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid Link')).toBeInTheDocument()
      })
    })

    it('should show one-time link used message for used one-time links', async () => {
      mockGetBookingLinkByUuid.mockResolvedValue({
        ...mockBookingLink,
        linkType: 'oneTime'
      })
      mockIsOneTimeLinkUsed.mockResolvedValue(true)
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('This one-time booking link has already been used.')).toBeInTheDocument()
      })
    })
  })

  describe('Form Rendering', () => {
    it('should render all required form fields', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/room/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument()
      })
    })

    it('should render rooms as selectable cards', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Meeting Room A')).toBeInTheDocument()
        expect(screen.getByText('Conference Room B')).toBeInTheDocument()
        expect(screen.getByText('Small meeting room')).toBeInTheDocument()
      })
    })

    it('should render time slots as selectable cards', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Morning')).toBeInTheDocument()
        expect(screen.getByText('Afternoon')).toBeInTheDocument()
        expect(screen.getByText('(09:00 - 12:00)')).toBeInTheDocument()
        expect(screen.getByText('(13:00 - 17:00)')).toBeInTheDocument()
      })
    })

    it('should render terms and conditions when configured', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
        expect(screen.getByText('Please agree to our terms')).toBeInTheDocument()
        expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    it('should allow selecting a room', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Meeting Room A')).toBeInTheDocument()
      })
      
      const roomCard = screen.getByText('Meeting Room A').closest('div')
      await user.click(roomCard!)
      
      expect(roomCard).toHaveClass('border-2', 'border-blue-600')
    })

    it('should allow selecting a time slot', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Morning')).toBeInTheDocument()
      })
      
      const timeSlotCard = screen.getByText('Morning').closest('div')
      await user.click(timeSlotCard!)
      
      expect(timeSlotCard).toHaveClass('border-2', 'border-purple-600')
    })

    it('should allow selecting a date', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('day-picker')).toBeInTheDocument()
      })
      
      const selectDateButton = screen.getByTestId('select-date-button')
      await user.click(selectDateButton)
      
      expect(screen.getByTestId('selected-date')).toBeInTheDocument()
    })

    it('should allow filling custom fields', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
      
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
    })

    it('should allow agreeing to terms', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument()
      })
      
      const termsCheckbox = screen.getByLabelText(/i agree to the terms/i)
      await user.click(termsCheckbox)
      
      expect(termsCheckbox).toBeChecked()
    })
  })

  describe('Form Validation', () => {
    it('should disable submit button when required fields are empty', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
      })
      
      const submitButton = screen.getByRole('button', { name: /book now/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when all required fields are filled', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
      
      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByTestId('select-date-button'))
      await user.click(screen.getByText('Meeting Room A').closest('div')!)
      await user.click(screen.getByText('Morning').closest('div')!)
      await user.click(screen.getByLabelText(/i agree to the terms/i))
      
      const submitButton = screen.getByRole('button', { name: /book now/i })
      expect(submitButton).toBeEnabled()
    })

    it('should show validation errors for required custom fields', async () => {
      const user = userEvent.setup()
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
      })
      
      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /book now/i })
      
      // Enable the button by filling some fields but not all
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.click(screen.getByTestId('select-date-button'))
      await user.click(screen.getByText('Meeting Room A').closest('div')!)
      await user.click(screen.getByText('Morning').closest('div')!)
      await user.click(screen.getByLabelText(/i agree to the terms/i))
      
      // Email is still empty, so validation should fail
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please fill all required fields/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit booking successfully with valid data', async () => {
      const user = userEvent.setup()
      
      mockCreateBooking.mockResolvedValue({
        success: true,
        bookingNumber: 'BK-123456'
      })
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
      
      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByTestId('select-date-button'))
      await user.click(screen.getByText('Meeting Room A').closest('div')!)
      await user.click(screen.getByText('Morning').closest('div')!)
      await user.click(screen.getByLabelText(/i agree to the terms/i))
      
      const submitButton = screen.getByRole('button', { name: /book now/i })
      await user.click(submitButton)
      
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          customFieldData: expect.objectContaining({
            '1': 'John Doe',
            '2': 'john@example.com'
          }),
          selectedDate: expect.any(Date),
          selectedRoomId: '1',
          selectedTimeSlotId: '1',
          agreedToTerms: true,
          linkId: 1,
          companyId: 1,
          approvalMode: 'auto'
        })
      )
    })

    it('should show error message when booking submission fails', async () => {
      const user = userEvent.setup()
      
      mockCreateBooking.mockResolvedValue({
        success: false,
        message: 'Booking failed due to conflict'
      })
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
      
      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByTestId('select-date-button'))
      await user.click(screen.getByText('Meeting Room A').closest('div')!)
      await user.click(screen.getByText('Morning').closest('div')!)
      await user.click(screen.getByLabelText(/i agree to the terms/i))
      
      const submitButton = screen.getByRole('button', { name: /book now/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Booking failed due to conflict')).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock a slow submission
      mockCreateBooking.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, bookingNumber: 'BK-123456' }), 1000)
      ))
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
      
      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.click(screen.getByTestId('select-date-button'))
      await user.click(screen.getByText('Meeting Room A').closest('div')!)
      await user.click(screen.getByText('Morning').closest('div')!)
      await user.click(screen.getByLabelText(/i agree to the terms/i))
      
      const submitButton = screen.getByRole('button', { name: /book now/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Company Selection', () => {
    it('should show company selector when no linked company', async () => {
      mockGetBookingLinkByUuid.mockResolvedValue({
        ...mockBookingLink,
        companyId: null
      })
      
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Select Company')).toBeInTheDocument()
      })
    })

    it('should show readonly company field when linked to specific company', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Company')).toHaveAttribute('readonly')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/room/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument()
      })
    })

    it('should have proper button roles', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
      })
    })

    it('should have proper form structure', async () => {
      render(<BookingPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
      })
    })
  })
})
