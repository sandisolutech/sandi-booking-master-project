import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/app/admin/settings/auth-actions'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user
    
    // Add session expiry to user data
    const sessionData = {
      ...userWithoutPassword,
      sessionExpiry: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
    }

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: sessionData
    })

    // Set session cookie with expiry
    response.cookies.set('userSession', JSON.stringify(sessionData), {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
