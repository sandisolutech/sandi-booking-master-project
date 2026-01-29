import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { replaceLINEMessageVariables } from '@/lib/line-message-utils'

interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

interface UseLiffReturn {
  isLoggedIn: boolean
  isInClient: boolean
  profile: LiffProfile | null
  isLoading: boolean
  error: string | null
  login: () => void
  logout: () => void
  sendMessage: (message: string) => Promise<void>
  shareTargetPicker: (message: string) => Promise<void>
  getSuccessMessage: (variables?: MessageVariables) => Promise<string>
  getCancelMessage: (variables?: MessageVariables) => Promise<string>
  sendBookingMessage: (type: 'success' | 'cancel', variables: MessageVariables) => Promise<void>
}

interface MessageVariables {
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

export const useLiff = (liffId?: string): UseLiffReturn => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInClient, setIsInClient] = useState(false)
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch LINE configuration from database
        let liffIdToUse = liffId
        
        if (!liffIdToUse) {
          try {
            const response = await fetch('/api/line-config')
            const lineConfig = await response.json()
            liffIdToUse = lineConfig.liffId
            
            console.log('LINE Config fetched from database:', {
              liffId: lineConfig.liffId,
              hasLiffId: !!lineConfig.liffId
            })
          } catch (fetchError) {
            console.warn('Failed to fetch LINE config from database, using env fallback:', fetchError)
            liffIdToUse = process.env.NEXT_PUBLIC_LIFF_ID
          }
        }
        
        console.log('LIFF Initialization Debug:', {
          liffIdToUse,
          hasLiffId: !!liffIdToUse,
          source: liffId ? 'parameter' : 'database/env'
        })
        
        if (!liffIdToUse) {
          console.error('LIFF ID is not configured in database or environment')
          // setError('LIFF ID is not configured')
          setIsLoading(false)
          return
        }

        console.log('Initializing LIFF with ID:', liffIdToUse)
        await liff.init({ liffId: liffIdToUse })
        console.log('LIFF initialized successfully')
        
        const inClient = liff.isInClient()
        const loggedIn = liff.isLoggedIn()
        
        console.log('LIFF Status After Init:', {
          isInClient: inClient,
          isLoggedIn: loggedIn
        })
        
        setIsInClient(inClient)
        
        if (loggedIn) {
          console.log('User is logged in, getting profile...')
          setIsLoggedIn(true)
          const userProfile = await liff.getProfile()
          console.log('Profile retrieved:', userProfile)
          setProfile(userProfile)
          
          // เพิ่ม console log เพื่อเช็คว่า state อัพเดทหรือยัง
          console.log('State updated - isLoggedIn:', true, 'profile:', userProfile)
        } else {
          console.log('User is not logged in')
          setIsLoggedIn(false)
          setProfile(null)
        }
      } catch (err) {
        console.error('Failed to initialize LIFF:', err)
        setError('Failed to initialize LINE app')
      } finally {
        console.log('LIFF initialization completed, setting loading to false')
        setIsLoading(false)
      }
    }

    initializeLiff()
  }, [liffId])

  const login = () => {
    console.log('Login button clicked, checking LIFF state:', {
      isLoggedIn: liff.isLoggedIn(),
      isInClient: liff.isInClient()
    })
    
    if (!liff.isLoggedIn()) {
      console.log('Calling liff.login()')
      liff.login()
    } else {
      console.log('User is already logged in')
    }
  }

  const logout = () => {
    if (liff.isLoggedIn()) {
      liff.logout()
      setIsLoggedIn(false)
      setProfile(null)
    }
  }

  const sendMessage = async (message: string) => {
    if (!liff.isInClient()) {
      throw new Error('This feature is only available in LINE app')
    }
    
    try {
      await liff.sendMessages([
        {
          type: 'text',
          text: message,
        },
      ])
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }

  const shareTargetPicker = async (message: string) => {
    if (!liff.isInClient()) {
      throw new Error('This feature is only available in LINE app')
    }

    try {
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: message,
        },
      ])
    } catch (err) {
      console.error('Failed to share message:', err)
      throw err
    }
  }

  const getSuccessMessage = async (variables?: MessageVariables): Promise<string> => {
    try {
      const response = await fetch('/api/line-config')
      const lineConfig = await response.json()
      const message = lineConfig.successMessage || 'Your booking has been confirmed successfully! Thank you for choosing our service.'
      
      if (!variables) return message
      
      // Replace variables in the message
      return replaceLINEMessageVariables(message, variables)
    } catch (error) {
      console.error('Failed to fetch success message:', error)
      return 'Your booking has been confirmed successfully! Thank you for choosing our service.'
    }
  }

  const getCancelMessage = async (variables?: MessageVariables): Promise<string> => {
    try {
      const response = await fetch('/api/line-config')
      const lineConfig = await response.json()
      const message = lineConfig.cancelMessage || 'Your booking has been cancelled. If you need assistance, please contact our support team.'
      
      if (!variables) return message
      
      // Replace variables in the message
      return replaceLINEMessageVariables(message, variables)
    } catch (error) {
      console.error('Failed to fetch cancel message:', error)
      return 'Your booking has been cancelled. If you need assistance, please contact our support team.'
    }
  }

  const sendBookingMessage = async (type: 'success' | 'cancel', variables: MessageVariables): Promise<void> => {
    if (!isInClient || !isLoggedIn) {
      throw new Error('LINE messaging is only available for logged-in users in LINE app')
    }

    try {
      const message = type === 'success' 
        ? await getSuccessMessage(variables)
        : await getCancelMessage(variables)
      
      await sendMessage(message)
    } catch (error) {
      console.error(`Failed to send ${type} message:`, error)
      throw error
    }
  }

  return {
    isLoggedIn,
    isInClient,
    profile,
    isLoading,
    error,
    login,
    logout,
    sendMessage,
    shareTargetPicker,
    getSuccessMessage,
    getCancelMessage,
    sendBookingMessage,
  }
}
