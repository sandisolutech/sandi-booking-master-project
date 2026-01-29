"use client"

import React from 'react'
import Link from 'next/link'
import { useLiff } from '@/hooks/use-liff'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, User, Smartphone, Calendar, Home } from 'lucide-react'

interface LiffLayoutProps {
  children: React.ReactNode
  showProfile?: boolean
  requireLogin?: boolean
}

export const LiffLayout: React.FC<LiffLayoutProps> = ({ 
  children, 
  showProfile = true, 
  requireLogin = false 
}) => {
  const { 
    isLoggedIn, 
    isInClient, 
    profile, 
    isLoading, 
    error, 
    login 
  } = useLiff()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Initializing LINE app...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <Smartphone className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">App Error</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500">
              Please make sure you're accessing this from the LINE app.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Require login but not logged in
  if (requireLogin && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <LogIn className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h2>
            <p className="text-sm text-gray-600 mb-6">
              Please log in with your LINE account to continue.
            </p>
            <Button 
              onClick={login} 
              className="w-full bg-[#00B900] hover:bg-[#009900] text-white"
            >
              Login with LINE
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* LIFF Header - only show if logged in and showProfile is true */}
      {isLoggedIn && showProfile && profile && (
        <div className="bg-white border-b border-gray-200">
          {/* Profile Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {profile.pictureUrl ? (
                <img
                  src={profile.pictureUrl}
                  alt={profile.displayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.displayName}
                </p>
                {profile.statusMessage && (
                  <p className="text-xs text-gray-500 truncate">
                    {profile.statusMessage}
                  </p>
                )}
              </div>
              {isInClient && (
                <div className="px-2 py-1 bg-green-100 rounded-full">
                  <span className="text-xs text-green-800 font-medium">LINE</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Section */}
          <div className="px-4 py-2">
            <div className="flex space-x-4">
              <Link 
                href="/my-bookings" 
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
