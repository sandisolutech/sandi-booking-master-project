/**
 * Unit Tests for Booking Page Business Logic
 * 
 * These tests focus on pure functions and business logic
 * that can be extracted and tested independently.
 */

describe('Booking Page Business Logic Tests', () => {
  
  describe('Date Validation Logic', () => {
    // Test the date validation logic that would be used in the booking page
    const isDateInValidRange = (date: Date): boolean => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return date >= today && date <= thirtyDaysFromNow
    }

    it('should accept dates starting from today', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expect(isDateInValidRange(today)).toBe(true)
    })

    it('should accept dates within 30 days', () => {
      const validDate = new Date()
      validDate.setDate(validDate.getDate() + 15)
      expect(isDateInValidRange(validDate)).toBe(true)
    })

    it('should reject past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isDateInValidRange(yesterday)).toBe(false)
    })

    it('should reject dates more than 30 days away', () => {
      const farFuture = new Date()
      farFuture.setDate(farFuture.getDate() + 31)
      expect(isDateInValidRange(farFuture)).toBe(false)
    })
  })

  describe('Form Validation Logic', () => {
    // Test form validation logic
    const validateCustomFields = (customFields: any[], customFieldData: Record<string, any>): Record<string, string> => {
      const errors: Record<string, string> = {}
      
      for (const field of customFields) {
        if (field.isRequired) {
          const value = customFieldData[field.id]
          if (!value || (typeof value === 'string' && value.trim() === '') || 
              (Array.isArray(value) && value.length === 0)) {
            errors[field.id] = `${field.title} is required`
          }
        }
      }
      
      return errors
    }

    it('should validate required text fields', () => {
      const customFields = [
        { id: '1', title: 'Full Name', isRequired: true },
        { id: '2', title: 'Email', isRequired: true },
        { id: '3', title: 'Optional Field', isRequired: false }
      ]
      
      const customFieldData = {
        '1': 'John Doe',
        '2': '', // Empty required field
        '3': '' // Empty optional field
      }
      
      const errors = validateCustomFields(customFields, customFieldData)
      
      expect(errors['1']).toBeUndefined() // No error for filled required field
      expect(errors['2']).toBe('Email is required') // Error for empty required field
      expect(errors['3']).toBeUndefined() // No error for empty optional field
    })

    it('should validate required array fields', () => {
      const customFields = [
        { id: '1', title: 'Multi-select', isRequired: true }
      ]
      
      const customFieldDataEmpty = { '1': [] }
      const customFieldDataFilled = { '1': ['option1'] }
      
      const errorsEmpty = validateCustomFields(customFields, customFieldDataEmpty)
      const errorsFilled = validateCustomFields(customFields, customFieldDataFilled)
      
      expect(errorsEmpty['1']).toBe('Multi-select is required')
      expect(errorsFilled['1']).toBeUndefined()
    })

    it('should validate whitespace-only strings as empty', () => {
      const customFields = [
        { id: '1', title: 'Name', isRequired: true }
      ]
      
      const customFieldData = { '1': '   ' } // Only whitespace
      const errors = validateCustomFields(customFields, customFieldData)
      
      expect(errors['1']).toBe('Name is required')
    })
  })

  describe('Booking Submission Logic', () => {
    // Test booking submission data preparation
    const prepareBookingData = (formData: any) => {
      return {
        customFieldData: formData.customFieldData || {},
        selectedDate: formData.selectedDate,
        selectedRoomId: formData.selectedRoomId,
        selectedTimeSlotId: formData.selectedTimeSlotId,
        customCompanyName: formData.customCompanyName || null,
        agreedToTerms: formData.agreedToTerms,
        linkId: formData.linkId,
        companyId: formData.companyId,
        approvalMode: formData.approvalMode,
        lineProfile: formData.lineProfile || null
      }
    }

    it('should prepare booking data correctly', () => {
      const formData = {
        customFieldData: { '1': 'John Doe', '2': 'john@example.com' },
        selectedDate: new Date('2024-01-01'),
        selectedRoomId: '1',
        selectedTimeSlotId: '1',
        agreedToTerms: true,
        linkId: 1,
        companyId: 1,
        approvalMode: 'auto'
      }
      
      const bookingData = prepareBookingData(formData)
      
      expect(bookingData.customFieldData).toEqual(formData.customFieldData)
      expect(bookingData.selectedDate).toEqual(formData.selectedDate)
      expect(bookingData.selectedRoomId).toBe('1')
      expect(bookingData.selectedTimeSlotId).toBe('1')
      expect(bookingData.agreedToTerms).toBe(true)
      expect(bookingData.customCompanyName).toBeNull()
      expect(bookingData.lineProfile).toBeNull()
    })

    it('should handle optional fields', () => {
      const formData = {
        customFieldData: {},
        selectedDate: new Date('2024-01-01'),
        selectedRoomId: '1',
        selectedTimeSlotId: '1',
        agreedToTerms: true,
        linkId: 1,
        companyId: 1,
        approvalMode: 'auto',
        customCompanyName: 'Custom Company',
        lineProfile: { userId: 'user123', displayName: 'John' }
      }
      
      const bookingData = prepareBookingData(formData)
      
      expect(bookingData.customCompanyName).toBe('Custom Company')
      expect(bookingData.lineProfile).toEqual({ userId: 'user123', displayName: 'John' })
    })
  })

  describe('UI State Logic', () => {
    // Test UI state management logic
    const shouldDisableSubmitButton = (state: any): boolean => {
      // Check if any required custom fields are empty
      const hasEmptyRequiredFields = state.customFields?.some((field: any) => {
        if (!field.isRequired) return false
        const value = state.customFieldData?.[field.id]
        return !value || (typeof value === 'string' && value.trim() === '') || 
               (Array.isArray(value) && value.length === 0)
      })

      // Check if other required fields are empty
      const hasEmptyRequiredData = !state.selectedDate ||
                                   !state.selectedRoom ||
                                   !state.selectedTimeSlot ||
                                   (!state.linkedCompany && !state.selectedCompanyId) ||
                                   (state.hasTerms && !state.agreeToTerms)

      return Boolean(state.isSubmitting || hasEmptyRequiredFields || hasEmptyRequiredData)
    }

    it('should disable submit when required fields are empty', () => {
      const state = {
        customFields: [
          { id: '1', title: 'Name', isRequired: true }
        ],
        customFieldData: { '1': '' },
        selectedDate: new Date(),
        selectedRoom: '1',
        selectedTimeSlot: '1',
        selectedCompanyId: '1',
        hasTerms: true,
        agreeToTerms: true,
        isSubmitting: false
      }
      
      expect(shouldDisableSubmitButton(state)).toBe(true)
    })

    it('should disable submit when no date selected', () => {
      const state = {
        customFields: [
          { id: '1', title: 'Name', isRequired: true }
        ],
        customFieldData: { '1': 'John Doe' },
        selectedDate: null,
        selectedRoom: '1',
        selectedTimeSlot: '1',
        selectedCompanyId: '1',
        hasTerms: true,
        agreeToTerms: true,
        isSubmitting: false
      }
      
      expect(shouldDisableSubmitButton(state)).toBe(true)
    })

    it('should disable submit when terms not agreed', () => {
      const state = {
        customFields: [
          { id: '1', title: 'Name', isRequired: true }
        ],
        customFieldData: { '1': 'John Doe' },
        selectedDate: new Date(),
        selectedRoom: '1',
        selectedTimeSlot: '1',
        selectedCompanyId: '1',
        hasTerms: true,
        agreeToTerms: false,
        isSubmitting: false
      }
      
      expect(shouldDisableSubmitButton(state)).toBe(true)
    })

    it('should enable submit when all required fields filled', () => {
      const state = {
        customFields: [
          { id: '1', title: 'Name', isRequired: true }
        ],
        customFieldData: { '1': 'John Doe' },
        selectedDate: new Date(),
        selectedRoom: '1',
        selectedTimeSlot: '1',
        selectedCompanyId: '1',
        hasTerms: true,
        agreeToTerms: true,
        isSubmitting: false
      }
      
      expect(shouldDisableSubmitButton(state)).toBe(false)
    })

    it('should disable submit when submitting', () => {
      const state = {
        customFields: [],
        customFieldData: {},
        selectedDate: new Date(),
        selectedRoom: '1',
        selectedTimeSlot: '1',
        selectedCompanyId: '1',
        hasTerms: false,
        agreeToTerms: true,
        isSubmitting: true
      }
      
      expect(shouldDisableSubmitButton(state)).toBe(true)
    })
  })

  describe('Data Filtering Logic', () => {
    // Test data filtering logic
    const filterActiveItems = (items: any[]): any[] => {
      return items.filter(item => item.status === 'active')
    }

    it('should filter active rooms', () => {
      const rooms = [
        { id: 1, name: 'Room A', status: 'active' },
        { id: 2, name: 'Room B', status: 'inactive' },
        { id: 3, name: 'Room C', status: 'active' }
      ]
      
      const activeRooms = filterActiveItems(rooms)
      
      expect(activeRooms).toHaveLength(2)
      expect(activeRooms[0].name).toBe('Room A')
      expect(activeRooms[1].name).toBe('Room C')
    })

    it('should filter active time rounds', () => {
      const timeRounds = [
        { id: 1, name: 'Morning', isActive: true },
        { id: 2, name: 'Afternoon', isActive: false },
        { id: 3, name: 'Evening', isActive: true }
      ]
      
      const activeTimeRounds = filterActiveItems(timeRounds)
      
      expect(activeTimeRounds).toHaveLength(2)
      expect(activeTimeRounds[0].name).toBe('Morning')
      expect(activeTimeRounds[1].name).toBe('Evening')
    })
  })

  describe('Link Validation Logic', () => {
    // Test booking link validation logic
    const isValidBookingLink = (bookingLink: any, oneTimeLinkUsed: boolean = false): boolean => {
      if (!bookingLink) return false
      if (!bookingLink.isActive) return false
      if (bookingLink.linkType === 'oneTime' && oneTimeLinkUsed) return false
      return true
    }

    it('should validate active normal links', () => {
      const link = { isActive: true, linkType: 'normal' }
      expect(isValidBookingLink(link)).toBe(true)
    })

    it('should reject null links', () => {
      expect(isValidBookingLink(null)).toBe(false)
    })

    it('should reject inactive links', () => {
      const link = { isActive: false, linkType: 'normal' }
      expect(isValidBookingLink(link)).toBe(false)
    })

    it('should reject used one-time links', () => {
      const link = { isActive: true, linkType: 'oneTime' }
      expect(isValidBookingLink(link, true)).toBe(false)
    })

    it('should accept unused one-time links', () => {
      const link = { isActive: true, linkType: 'oneTime' }
      expect(isValidBookingLink(link, false)).toBe(true)
    })
  })

  describe('Error Message Logic', () => {
    // Test error message generation
    const getErrorMessage = (bookingLink: any, oneTimeLinkUsed: boolean): string => {
      if (!bookingLink || !bookingLink.isActive) {
        return 'Link has expired'
      }
      if (bookingLink.linkType === 'oneTime' && oneTimeLinkUsed) {
        return 'This one-time booking link has already been used.'
      }
      return ''
    }

    it('should return expired message for null link', () => {
      expect(getErrorMessage(null, false)).toBe('Link has expired')
    })

    it('should return expired message for inactive link', () => {
      const link = { isActive: false, linkType: 'normal' }
      expect(getErrorMessage(link, false)).toBe('Link has expired')
    })

    it('should return used message for used one-time link', () => {
      const link = { isActive: true, linkType: 'oneTime' }
      expect(getErrorMessage(link, true)).toBe('This one-time booking link has already been used.')
    })

    it('should return empty message for valid link', () => {
      const link = { isActive: true, linkType: 'normal' }
      expect(getErrorMessage(link, false)).toBe('')
    })
  })
})
