/**
 * LINE Integration Tests for Booking Detail Page
 * 
 * Tests all LINE login scenarios for the booking detail page:
 * 1. Auto-login when in LINE app and logged in
 * 2. Manual login with smart button and refresh
 * 3. Show login prompt when not logged in
 * 4. Send LINE message on cancellation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import BookingSuccessPage from '@/app/booking/[booking_number]/page'

// Mock next/navigation
const mockPush = jest.fn()
const mockParams = { booking_number: 'BK-001' }

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock LIFF hook
const mockSendMessage = jest.fn()
const mockLiffLogin = jest.fn()

jest.mock('@/hooks/use-liff', () => ({
  useLiff: jest.fn(),
}))

// Mock language context
jest.mock('@/lib/language-context', () => ({
  useLanguage: () => ({
    t: {
      bookingDetails: 'Booking Details',
      loginWithLine: 'Login with LINE',
      bookingConfirmed: 'Booking Confirmed',
      cancelled: 'Cancelled',
      date: 'Date',
      timeSlot: 'Time Slot',
      room: 'Room',
      cancelBooking: 'Cancel Booking',
      confirmCancellation: 'Confirm Cancellation',
      cancel: 'Cancel',
      processing: 'Processing...',
    },
    language: 'en',
  }),
}))

// Mock actions
const mockBookingData = {
  id: 1,
  bookingNumber: 'BK-001',
  selectedDate: '2024-01-15',
  status: 'confirmed',
  roomId: 1,
  timeSlotId: 1,
  companyName: 'Test Company',
  linkUuid: 'test-link',
  customFieldData: {},
}

const mockRoom = {
  id: 1,
  name: 'Conference Room A',
}

const mockTimeRound = {
  id: 1,
  name: 'Morning Session',
  startTime: '09:00',
  endTime: '10:00',
}

const mockConfig = {
  companyName: 'Test Company',
  supportEmail: 'support@test.com',
  companyPhone: '+1234567890',
  companyWebsite: 'https://test.com',
}

jest.mock('@/app/admin/settings/actions', () => ({
  getGeneralConfig: jest.fn(() => Promise.resolve(mockConfig)),
}))

jest.mock('@/app/admin/rooms/actions', () => ({
  getAllRooms: jest.fn(() => Promise.resolve([mockRoom])),
}))

jest.mock('@/app/admin/settings/time-rounds/actions', () => ({
  getAllTimeRounds: jest.fn(() => Promise.resolve([mockTimeRound])),
}))

jest.mock('@/app/admin/companies/actions', () => ({
  getAllCompanies: jest.fn(() => Promise.resolve([])),
}))

jest.mock('@/app/admin/bookings/actions', () => ({
  getBookingByNumber: jest.fn(() => Promise.resolve(mockBookingData)),
  updateBookingStatus: jest.fn(() => Promise.resolve()),
}))

describe('Booking Detail Page - LINE Integration', () => {
  const { useLiff } = require('@/hooks/use-liff')

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockSendMessage.mockClear()
    mockLiffLogin.mockClear()
  })

  describe('User Not Logged In to LINE', () => {
    it('shows login prompt when user is not logged in', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
        expect(screen.getByText('Please login with LINE to view your booking details')).toBeInTheDocument()
        expect(screen.getByText('Login with LINE')).toBeInTheDocument()
      })
    })

    it('shows smart login button in LINE app', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const loginButtons = screen.getAllByText('Login with LINE')
        expect(loginButtons.length).toBeGreaterThan(0)
      })
    })

    it('handles login button click with page refresh', async () => {
      const mockReload = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      })

      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const loginButton = screen.getAllByText('Login with LINE')[0]
        fireEvent.click(loginButton)
      })

      await waitFor(() => {
        expect(mockLiffLogin).toHaveBeenCalled()
      })
    })

    it('shows browser helper text when not in LINE app', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: false,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText(/Open this link in the LINE app/)).toBeInTheDocument()
      })
    })
  })

  describe('User Logged In to LINE', () => {
    it('shows booking details when user is logged in', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Booking Confirmed')).toBeInTheDocument()
        expect(screen.getByText('Conference Room A')).toBeInTheDocument()
        expect(screen.getByText('Morning Session (09:00 - 10:00)')).toBeInTheDocument()
      })
    })

    it('shows cancel button for confirmed bookings', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Cancel Booking')).toBeInTheDocument()
      })
    })

    it('does not show cancel button for cancelled bookings', async () => {
      const cancelledBooking = { ...mockBookingData, status: 'cancelled' }
      const { getBookingByNumber } = require('@/app/admin/bookings/actions')
      getBookingByNumber.mockResolvedValueOnce(cancelledBooking)

      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Cancelled')).toBeInTheDocument()
        expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading spinner when fetching data and user is logged in', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      // Mock delayed response to show loading state
      const { getBookingByNumber } = require('@/app/admin/bookings/actions')
      getBookingByNumber.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockBookingData), 100))
      )

      render(<BookingSuccessPage />)

      expect(screen.getByText('Loading booking details...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Booking Confirmed')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('does not show loading spinner when user is not logged in', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading booking details...')).not.toBeInTheDocument()
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error message when booking is not found', async () => {
      const { getBookingByNumber } = require('@/app/admin/bookings/actions')
      getBookingByNumber.mockResolvedValueOnce(null)

      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Booking Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('LINE Message on Cancellation', () => {
    it('sends LINE message when booking is cancelled in LINE app', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel Booking')
        fireEvent.click(cancelButton)
      })

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i })
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith(
          expect.stringContaining('❌ Booking Cancelled')
        )
        expect(mockSendMessage).toHaveBeenCalledWith(
          expect.stringContaining('BK-001')
        )
      })
    })

    it('does not send LINE message when not in LINE app', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: false, // Not in LINE app
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel Booking')
        fireEvent.click(cancelButton)
      })

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i })
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockSendMessage).not.toHaveBeenCalled()
      })
    })

    it('does not send LINE message when not logged in', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      // Should not even see cancel button when not logged in
      await waitFor(() => {
        expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument()
      })
    })
  })

  describe('Auto-login on Page Load', () => {
    it('loads booking data immediately when user is logged in', async () => {
      const { getBookingByNumber } = require('@/app/admin/bookings/actions')

      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(getBookingByNumber).toHaveBeenCalledWith('BK-001')
        expect(screen.getByText('Booking Confirmed')).toBeInTheDocument()
      })
    })

    it('loads basic config data even when not logged in', async () => {
      const { getGeneralConfig } = require('@/app/admin/settings/actions')

      useLiff.mockReturnValue({
        isLoggedIn: false,
        isInClient: true,
        profile: null,
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        expect(getGeneralConfig).toHaveBeenCalled()
      })
    })
  })

  describe('Navigation Actions', () => {
    it('navigates to make another booking', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const anotherBookingButton = screen.getByText(/make another booking/i)
        fireEvent.click(anotherBookingButton)
      })

      expect(mockPush).toHaveBeenCalledWith('/register/test-link')
    })

    it('navigates to my bookings', async () => {
      useLiff.mockReturnValue({
        isLoggedIn: true,
        isInClient: true,
        profile: { displayName: 'John Doe', userId: 'user123' },
        sendMessage: mockSendMessage,
        login: mockLiffLogin,
        isLoading: false,
      })

      render(<BookingSuccessPage />)

      await waitFor(() => {
        const myBookingsButton = screen.getByText(/see my bookings/i)
        fireEvent.click(myBookingsButton)
      })

      expect(mockPush).toHaveBeenCalledWith('/my-bookings')
    })
  })
})
