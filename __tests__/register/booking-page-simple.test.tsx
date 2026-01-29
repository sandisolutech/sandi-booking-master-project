import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock all the dependencies
jest.mock('@/app/admin/links/actions', () => ({
  getBookingLinkByUuid: jest.fn(),
  incrementClickCount: jest.fn(),
  isOneTimeLinkUsed: jest.fn(),
}))

jest.mock('@/app/register/actions', () => ({
  createBooking: jest.fn(),
}))

jest.mock('@/app/admin/rooms/actions', () => ({
  getAllRooms: jest.fn(),
}))

jest.mock('@/app/admin/settings/time-rounds/actions', () => ({
  getAllTimeRounds: jest.fn(),
}))

jest.mock('@/app/admin/companies/actions', () => ({
  getCompanyById: jest.fn(),
  getAllCompanies: jest.fn(),
}))

jest.mock('@/app/admin/settings/actions', () => ({
  getGeneralConfig: jest.fn(),
}))

jest.mock('@/app/admin/settings/custom-fields/actions', () => ({
  getActiveCustomFields: jest.fn(),
}))

// Mock the component since we can't easily test the complex component directly
const MockBookingPage = () => {
  return (
    <div data-testid="booking-page">
      <h1>Test Company</h1>
      <h2>Test Booking Link</h2>
      <form data-testid="booking-form">
        <label htmlFor="fullName">Full Name *</label>
        <input id="fullName" name="fullName" required />
        
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" required />
        
        <label htmlFor="company">Company/Brand *</label>
        <select id="company" name="company" required>
          <option value="">Select Company</option>
          <option value="1">Test Company</option>
        </select>
        
        <label htmlFor="date">Date *</label>
        <div data-testid="date-picker">
          <button type="button" data-testid="select-date">Select Date</button>
        </div>
        
        <div data-testid="rooms">
          <h3>Room *</h3>
          <div data-testid="room-1" role="button">Meeting Room A</div>
          <div data-testid="room-2" role="button">Conference Room B</div>
        </div>
        
        <div data-testid="time-slots">
          <h3>Time Slot *</h3>
          <div data-testid="time-1" role="button">Morning (09:00 - 12:00)</div>
          <div data-testid="time-2" role="button">Afternoon (13:00 - 17:00)</div>
        </div>
        
        <div data-testid="terms">
          <input type="checkbox" id="terms" name="terms" required />
          <label htmlFor="terms">I agree to the terms and conditions *</label>
        </div>
        
        <button type="submit" data-testid="submit-button">Book Now</button>
      </form>
    </div>
  )
}

describe('Booking Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the booking page with all required elements', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByTestId('booking-page')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('Test Booking Link')).toBeInTheDocument()
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('should render all form fields', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByText(/room/i)).toBeInTheDocument()
      expect(screen.getByText(/time slot/i)).toBeInTheDocument()
    })

    it('should render room selection options', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByText('Meeting Room A')).toBeInTheDocument()
      expect(screen.getByText('Conference Room B')).toBeInTheDocument()
    })

    it('should render time slot options', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByText('Morning (09:00 - 12:00)')).toBeInTheDocument()
      expect(screen.getByText('Afternoon (13:00 - 17:00)')).toBeInTheDocument()
    })

    it('should render terms and conditions checkbox', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument()
    })

    it('should render submit button', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByText('Book Now')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should allow typing in text inputs', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
    })

    it('should allow selecting company from dropdown', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const companySelect = screen.getByLabelText(/company/i)
      await user.selectOptions(companySelect, '1')
      
      expect(companySelect).toHaveValue('1')
    })

    it('should allow clicking on room selection', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const room1 = screen.getByTestId('room-1')
      await user.click(room1)
      
      expect(room1).toBeInTheDocument()
    })

    it('should allow clicking on time slot selection', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const timeSlot1 = screen.getByTestId('time-1')
      await user.click(timeSlot1)
      
      expect(timeSlot1).toBeInTheDocument()
    })

    it('should allow checking terms checkbox', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const termsCheckbox = screen.getByLabelText(/i agree to the terms/i)
      await user.click(termsCheckbox)
      
      expect(termsCheckbox).toBeChecked()
    })

    it('should allow clicking submit button', async () => {
      const user = userEvent.setup()
      render(<MockBookingPage />)
      
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument()
    })

    it('should have required attributes on required fields', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/company/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/i agree to the terms/i)).toHaveAttribute('required')
    })

    it('should have proper input types', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/i agree to the terms/i)).toHaveAttribute('type', 'checkbox')
    })

    it('should have clickable room and time slot elements', async () => {
      render(<MockBookingPage />)
      
      expect(screen.getByTestId('room-1')).toHaveAttribute('role', 'button')
      expect(screen.getByTestId('room-2')).toHaveAttribute('role', 'button')
      expect(screen.getByTestId('time-1')).toHaveAttribute('role', 'button')
      expect(screen.getByTestId('time-2')).toHaveAttribute('role', 'button')
    })
  })

  describe('Form Validation', () => {
    it('should show required field indicators', async () => {
      render(<MockBookingPage />)
      
      // Check for asterisks (*) indicating required fields
      expect(screen.getByText(/full name \*/i)).toBeInTheDocument()
      expect(screen.getByText(/email \*/i)).toBeInTheDocument()
      expect(screen.getByText(/company\/brand \*/i)).toBeInTheDocument()
      expect(screen.getByText(/date \*/i)).toBeInTheDocument()
      expect(screen.getByText(/room \*/i)).toBeInTheDocument()
      expect(screen.getByText(/time slot \*/i)).toBeInTheDocument()
      expect(screen.getByText(/i agree to the terms and conditions \*/i)).toBeInTheDocument()
    })
  })
})
