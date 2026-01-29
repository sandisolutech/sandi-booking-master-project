"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, MapPin, Building, User, LogIn } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-switcher"
import { CompanyLogo } from "@/components/company-logo"
import { getBookingsByLineUserId } from "@/app/register/actions"
import { useLiff } from "@/hooks/use-liff"
import { LiffLayout } from "@/components/liff-layout"

type BookingData = {
  id: number
  bookingNumber: string
  selectedDate: Date
  status: string
  roomName: string
  roomDescription: string
  timeSlotName: string
  startTime: string
  endTime: string
  companyName: string
  linkName: string
  customFieldData: Record<string, any>
  lineDisplayName: string
  linePictureUrl: string
  createdAt: Date
  updatedAt: Date
}

export default function MyBookingsPage() {
  const { t, language } = useLanguage()
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // LIFF integration - using same naming as register page
  const { 
    isLoggedIn: isLiffLoggedIn, 
    isInClient: isLiffInClient, 
    profile: liffProfile,
    login: liffLogin,
    isLoading: isLiffLoading
  } = useLiff()

  useEffect(() => {
    // Console log to check LINE profile login status - same as register page
    console.log('🔍 My Bookings - LINE Profile Status Debug:', {
      isLiffLoggedIn,
      isLiffInClient,
      isLiffLoading,
      liffProfile,
      hasProfile: !!liffProfile,
      userAgent: navigator.userAgent,
      isLineApp: navigator.userAgent.includes('Line'),
      isLineInApp: navigator.userAgent.includes('Line') && navigator.userAgent.includes('Mobile'),
      url: window.location.href
    });

    // Only load bookings if user is logged in and we have a profile
    if (isLiffLoggedIn && liffProfile && liffProfile.userId) {
      const loadBookings = async () => {
        console.log('🔄 Loading bookings for user:', liffProfile.userId);
        setLoading(true);
        try {
          const userBookings = await getBookingsByLineUserId(liffProfile.userId);
          setBookings(userBookings);
        } catch (err) {
          console.error("Error loading bookings:", err);
          setError("Failed to load your bookings");
        } finally {
          setLoading(false);
        }
      };

      loadBookings();
    } else {
      // Not logged in or no profile, stop loading
      setLoading(false);
    }
  }, [isLiffLoggedIn, liffProfile])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'confirmed': t.confirmed || 'Confirmed',
      'pending': t.pending || 'Pending',
      'cancelled': t.cancelled || 'Cancelled',
      'completed': t.completed || 'Completed'
    }
    return statusMap[status.toLowerCase()] || status
  }

  // Loading state - show loading when actually loading bookings
  if (loading) {
    return (
      <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your bookings...</p>
            </CardContent>
          </Card>
        </div>
      </LiffLayout>
    )
  }

  // Error state - matching register page style
  if (error) {
    return (
      <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-end mb-4">
                <LanguageToggle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t.error || "Error"}
              </h2>
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </LiffLayout>
    )
  }

  // Main content - show page content, with optional LINE profile
  return (
    <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <CompanyLogo size="sm" />
              <h1 className="text-3xl font-bold text-gray-900">
                {t.myBookings || "My Bookings"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Show login button if not logged in and in LIFF client */}
              {!isLiffLoggedIn && isLiffInClient && !isLiffLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await liffLogin()
                      // Force a page refresh after login to update the UI state
                      window.location.reload()
                    } catch (error) {
                      console.error("Login failed:", error)
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                  <LogIn className="w-4 h-4" />
                  {t.loginWithLine || "Login with LINE"}
                </Button>
              )}
              <LanguageToggle />
            </div>
          </div>

          {/* Show notice if not logged in */}
          {!isLiffLoggedIn && (
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-blue-800">
                  <User className="w-5 h-5" />
                  <div>
                    <p className="font-medium">
                      {isLiffInClient 
                        ? "Log in with LINE to see your personal bookings"
                        : "Access from LINE app for personalized booking history"}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      {isLiffInClient 
                        ? "Currently showing public view"
                        : "Open this page in the LINE app to log in"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {bookings.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {isLiffLoggedIn 
                    ? (t.noBookings || "No Bookings Found")
                    : "Welcome to My Bookings"
                  }
                </h2>
                <p className="text-gray-600">
                  {isLiffLoggedIn 
                    ? (t.noBookingsMessage || "You haven't made any bookings yet.")
                    : "Log in with LINE to see your booking history here."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/booking/${booking.bookingNumber}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {booking.linkName}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {t.bookingNumber || "Booking"} #{booking.bookingNumber}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(booking.selectedDate, "PPP")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t.date || "Date"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.timeSlotName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.roomName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.roomDescription || t.room || "Room"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t.company || "Company"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.customFieldData && Object.keys(booking.customFieldData).length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {t.additionalDetails || "Additional Details"}
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(booking.customFieldData).map(([key, field]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {field.title || key}:
                              </span>
                              <span className="text-sm text-gray-600">
                                {Array.isArray(field.value) 
                                  ? field.value.join(", ") 
                                  : field.value?.toString() || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 border-t pt-3">
                      {t.createdAt || "Created"}: {format(booking.createdAt, "PPpp")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </LiffLayout>
  )
}
