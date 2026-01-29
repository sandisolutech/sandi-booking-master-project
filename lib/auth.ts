"use client"

export interface UserSession {
  id: number
  name: string
  email: string
  role: "Administrator" | "Manager" | "Staff"
  status: "Active" | "Inactive"
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  sessionExpiry: number
}

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
const SESSION_WARNING_TIME = 15 * 60 * 1000 // 15 minutes before expiry

export function setUserSession(user: any): void {
  const sessionData: UserSession = {
    ...user,
    sessionExpiry: Date.now() + SESSION_DURATION
  }
  localStorage.setItem('userSession', JSON.stringify(sessionData))
}

export function getUserSession(): UserSession | null {
  try {
    const sessionStr = localStorage.getItem('userSession')
    if (!sessionStr) return null
    
    const session: UserSession = JSON.parse(sessionStr)
    
    // Check if session is expired
    if (Date.now() > session.sessionExpiry) {
      clearUserSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error parsing user session:', error)
    clearUserSession()
    return null
  }
}

export function clearUserSession(): void {
  localStorage.removeItem('userSession')
}

export function isAuthenticated(): boolean {
  return getUserSession() !== null
}

export function refreshSession(): void {
  const session = getUserSession()
  if (session) {
    session.sessionExpiry = Date.now() + SESSION_DURATION
    localStorage.setItem('userSession', JSON.stringify(session))
  }
}

export function getSessionTimeRemaining(): number {
  const session = getUserSession()
  if (!session) return 0
  return Math.max(0, session.sessionExpiry - Date.now())
}

export function isSessionExpiringSoon(): boolean {
  const timeRemaining = getSessionTimeRemaining()
  return timeRemaining > 0 && timeRemaining <= SESSION_WARNING_TIME
}

export function getSessionExpiryDate(): Date | null {
  const session = getUserSession()
  if (!session) return null
  return new Date(session.sessionExpiry)
}

// Auto-logout timer for client-side session management
export function startSessionTimer(onExpire: () => void, onWarning?: () => void): NodeJS.Timeout {
  const checkSession = () => {
    const session = getUserSession()
    if (!session) {
      onExpire()
      return
    }
    
    if (isSessionExpiringSoon() && onWarning) {
      onWarning()
    }
  }
  
  // Check session every minute
  return setInterval(checkSession, 60 * 1000)
}
