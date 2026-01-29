"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { CalendarIcon, MapPin, Clock, Check, ExternalLink, Mail, Phone, LogIn, Download, Share, Copy, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-switcher"
import { getGeneralConfig, type GeneralConfig } from "@/app/admin/settings/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getAllCompanies, type Company } from "@/app/admin/companies/actions"
import { getBookingByNumber, updateBookingStatus } from "@/app/admin/bookings/actions"
import { BOOKING_STATUS } from "@/app/admin/bookings/types"
import { CustomFieldDisplay } from "@/components/custom-field-display"
import { CompanyLogo } from "@/components/company-logo"
import { useLiff } from "@/hooks/use-liff"
import { LiffLayout } from "@/components/liff-layout"
import { useToast } from "@/hooks/use-toast"
import { saveToPDF, saveToImage, copyToClipboard } from "@/lib/export-utils"

export default function BookingSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const bookingNumber = params.booking_number as string
  const { t } = useLanguage()
  const { toast } = useToast()
  const bookingCardRef = useRef<HTMLDivElement>(null)

  const [companySettings, setCompanySettings] = useState<GeneralConfig | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  // LIFF integration
  const { 
    isLoggedIn: isLiffLoggedIn, 
    isInClient: isLiffInClient, 
    profile: liffProfile, 
    sendMessage,
    sendBookingMessage,
    login: liffLogin,
    isLoading: isLiffLoading
  } = useLiff()

  useEffect(() => {
    // Console log to check LINE profile login status
    console.log('🔍 Booking Detail - LINE Profile Status Debug:', {
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

    // Load data immediately, don't wait for LINE login
    const loadData = async () => {
      try {
        const [settings, fetchedRooms, fetchedTimeRounds, fetchedCompanies] = await Promise.all([
          getGeneralConfig(),
          getAllRooms(),
          getAllTimeRounds(),
          getAllCompanies()
        ])

        setCompanySettings(settings)
        setRooms(fetchedRooms)
        setTimeRounds(fetchedTimeRounds)
        setAllCompanies(fetchedCompanies)

        // Fetch the booking details
        if (bookingNumber) {
          const bookingDetails = await getBookingByNumber(bookingNumber)
          console.log("Booking Details:", bookingDetails)
          setBooking(bookingDetails)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [bookingNumber]) // Remove LIFF dependencies from data loading

  const handleMakeAnotherBooking = () => {
    // Navigate back to the original booking link if available
    if (booking?.linkUuid) {
      router.push(`/register/${booking.linkUuid}`)
    } else {
      // Fallback to home or a general booking page
      router.push('/')
    }
  }

  const handleCancelBooking = async () => {
    if (!booking?.id) return
    
    setCancelLoading(true)
    try {
      await updateBookingStatus(booking.id.toString(), BOOKING_STATUS.CANCELLED)
      
      // Send cancellation message to LINE if user is in LINE app and logged in
      if (isLiffInClient && isLiffLoggedIn && companySettings) {
        try {
          const bookedRoom = rooms.find((room) => room.id === booking.roomId)
          const bookedTimeSlot = timeRounds.find((slot) => slot.id === booking.timeSlotId)
          
          // Get customer name from custom fields
          const customerName = booking.customFieldData 
            ? Object.values(booking.customFieldData).find(value => 
                typeof value === 'string' && value.trim().length > 0
              ) as string || liffProfile?.displayName || 'Customer'
            : liffProfile?.displayName || 'Customer'
          
          const messageVariables = {
            booking_number: booking.bookingNumber,
            company_name: companySettings.companyName,
            date: booking.selectedDate ? format(new Date(booking.selectedDate), "PPP") : "",
            time_slot: bookedTimeSlot ? `${bookedTimeSlot.startTime} - ${bookedTimeSlot.endTime}` : "",
            room_name: bookedRoom?.name || "",
            customer_name: customerName,
            booking_link: `${window.location.origin}/booking/${booking.bookingNumber}`,
            cancel_link: `${window.location.origin}/booking/${booking.bookingNumber}`,
            support_email: companySettings.supportEmail || companySettings.companyEmail
          }
          
          await sendBookingMessage('cancel', messageVariables)
          console.log("Cancellation message sent to LINE")
        } catch (error) {
          console.log("Could not send LINE cancellation message:", error)
        }
      }
      
      // Update local booking state
      setBooking(prev => ({
        ...prev,
        status: BOOKING_STATUS.CANCELLED
      }))
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      setError("Failed to cancel booking. Please try again.")
    } finally {
      setCancelLoading(false)
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await copyToClipboard(window.location.href)
      toast({
        title: "Link copied!",
        description: "Booking link has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  // Save as PDF
  const handleSavePDF = async () => {
    if (!bookingCardRef.current || !booking?.bookingNumber) return
    
    try {
      await saveToPDF(bookingCardRef.current, `booking-${booking.bookingNumber}.pdf`)
      toast({
        title: "PDF saved!",
        description: "Booking details saved as PDF",
      })
    } catch (error) {
      toast({
        title: "Failed to save PDF",
        description: "Could not generate PDF file",
        variant: "destructive",
      })
    }
  }

  // Save as image
  const handleSaveImage = async () => {
    if (!bookingCardRef.current || !booking?.bookingNumber) return
    
    try {
      await saveToImage(bookingCardRef.current, `booking-${booking.bookingNumber}.png`)
      toast({
        title: "Image saved!",
        description: "Booking details saved as image",
      })
    } catch (error) {
      toast({
        title: "Failed to save image",
        description: "Could not generate image file",
        variant: "destructive",
      })
    }
  }

  // Loading state - show loading while data is being fetched
  if (loading) {
    return (
      <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-end mb-4">
                <LanguageToggle />
              </div>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading booking details...</p>
            </CardContent>
          </Card>
        </div>
      </LiffLayout>
    )
  }

  // Error state or booking not found
  if (error || !booking) {
    return (
      <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-between items-center mb-4">
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
                </div>
                <LanguageToggle />
              </div>
              
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error ? (t.error || "Error") : "Booking Not Found"}
              </h2>
              <p className="text-gray-600 mb-4">
                {error || "The booking you're looking for could not be found or has been removed."}
              </p>
              
              {/* Show notice if not logged in */}
              {!isLiffLoggedIn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 {isLiffInClient 
                      ? "Log in with LINE to access your personal bookings"
                      : "For the best experience with LINE features"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {isLiffInClient 
                      ? "Some booking details may require login to view"
                      : "Open this link in the LINE app to access LINE features"}
                  </p>
                </div>
              )}
              
              {companySettings && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500">{t.contactSupport || "Contact support for assistance"}</p>
                  <p className="text-sm text-blue-600">{companySettings.supportEmail}</p>
                </div>
              )}
              
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  onClick={() => window.location.href = '/my-bookings'}
                  variant="outline"
                >
                  View My Bookings
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </LiffLayout>
    )
  }

  const bookedRoom = rooms.find((room) => room.id === booking.roomId)
  const bookedTimeSlot = timeRounds.find((slot) => slot.id === booking.timeSlotId)
  const companyForDisplay = booking.companyName || allCompanies.find((c) => c.id === booking.companyId)?.name || ""

  return (
    <LiffLayout showProfile={isLiffLoggedIn && !!liffProfile}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card ref={bookingCardRef} className="w-full max-w-4xl border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <CompanyLogo size="sm" />
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
              
              {/* Save/Share Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    Save & Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSavePDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Save as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveImage}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Save as Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <LanguageToggle />
          </div>
          
          {/* Show notice if not logged in */}
          {!isLiffLoggedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
              <p className="text-sm text-blue-800 mb-1">
                💡 {isLiffInClient 
                  ? "Log in with LINE for enhanced booking features"
                  : "Access from LINE app for personalized experience"}
              </p>
              <p className="text-xs text-blue-600">
                {isLiffInClient 
                  ? "Currently viewing in public mode"
                  : "Open in LINE app to access LINE features"}
              </p>
            </div>
          )}
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            booking.status === "confirmed" 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : booking.status === "cancelled"
              ? "bg-gradient-to-r from-gray-500 to-gray-600"
              : "bg-gradient-to-r from-yellow-500 to-orange-500"
          }`}>
            <Check className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {booking.status === "confirmed" 
              ? t.bookingConfirmed 
              : booking.status === "cancelled"
              ? t.cancelled
              : (t.bookingSubmitted || "Booking Submitted")}
          </CardTitle>
          <CardDescription className="text-lg">
            {booking.status === "confirmed" 
              ? t.reservationSuccess 
              : booking.status === "cancelled"
              ? "Your booking has been cancelled"
              : (t.reservationPendingApproval || "Your reservation is pending approval")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" ref={bookingCardRef}>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t.date}</p>
                <p className="font-semibold text-gray-900">
                  {booking.selectedDate ? format(new Date(booking.selectedDate), "MMMM d, yyyy") : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">{t.timeSlot}</p>
                <p className="font-semibold text-gray-900">
                  {bookedTimeSlot
                    ? `${bookedTimeSlot.name} (${bookedTimeSlot.startTime} - ${bookedTimeSlot.endTime})`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t.room}</p>
                <p className="font-semibold text-gray-900">{bookedRoom?.name}</p>
              </div>
            </div>
          </div>

          {/* Custom Field Data */}
          {booking.customFieldData && Object.keys(booking.customFieldData).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900 mb-3">Booking Information</h4>
              {Object.entries(booking.customFieldData).map(([fieldId, fieldData]: [string, any]) => {
                if (!fieldData || !fieldData.value) return null
                
                // Create a field object from the booking data
                const field = {
                  id: parseInt(fieldId),
                  title: fieldData.title,
                  fieldType: fieldData.fieldType,
                  // Add other required properties for CustomFieldDisplay
                  isRequired: false,
                  isActive: true,
                  orderIndex: 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
                
                return (
                  <CustomFieldDisplay
                    key={fieldId}
                    field={field}
                    value={fieldData.value}
                  />
                )
              })}
            </div>
          )}

          {booking.bookingNumber && (
            <div className="text-center text-gray-700 font-semibold">
              <p>
                {t.yourBookingNumber}: <span className="text-blue-600">{booking.bookingNumber}</span>
              </p>
            </div>
          )}

          <div className="text-center text-gray-600">
            {/* Find email from custom field data if available */}
            {(() => {
              let email = booking.email // Fallback to old email field if exists
              
              // Look for email in custom field data
              if (booking.customFieldData) {
                const emailEntry = Object.values(booking.customFieldData).find((field: any) => 
                  field && field.fieldType === 'email' && field.value
                ) as any
                if (emailEntry) {
                  email = emailEntry.value
                }
              }
              
              return email ? (
                <p>
                  {t.confirmationEmailSent} {email}
                </p>
              ) : null
            })()}
            <p className="mt-2">
              {t.thankYou} {companySettings.companyName}!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t.bookingFor} {companyForDisplay}
            </p>
          </div>

          {/* Approval Status Information */}
          {booking.status === "pending" && (
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t.awaitingApproval || "Awaiting Approval"}
              </h4>
              <p className="text-sm text-yellow-800">
                {t.approvalMessage || "Your booking request has been submitted and is waiting for approval. You will receive an email notification once your booking is reviewed and approved."}
              </p>
            </div>
          )}

          {/* Cancellation Status Information */}
          {booking.status === "cancelled" && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
              <h4 className="font-semibold text-red-900 mb-2">
                {t.cancelled}
              </h4>
              <p className="text-sm text-red-800">
                This booking has been cancelled. If you need to make a new booking, please use the button below.
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{t.needHelp}</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{companySettings.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{companySettings.companyPhone}</span>
              </div>
              {companySettings.companyWebsite && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <a
                    href={companySettings.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {t.visitWebsite}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Button - Only show for confirmed or pending bookings */}
          {booking.status !== BOOKING_STATUS.CANCELLED && booking.status !== BOOKING_STATUS.REJECTED && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? t.processing : t.cancelBooking}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.confirmCancellation}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.cancellationConfirmMessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelBooking}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t.confirmCancellation}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleMakeAnotherBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {t.makeAnotherBooking}
            </Button>
            <Button
              onClick={() => router.push('/my-bookings')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {t.seeMyBookings || "See My Bookings"}
            </Button>
          </div>

            {/* Action buttons for link, PDF, image (column layout) */}
            <div className="flex flex-col gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {t.copyLink || "Copy Link"}
            </Button>
            <Button
              onClick={handleSavePDF}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {t.saveAsPDF || "Save as PDF"}
            </Button>
            <Button
              onClick={handleSaveImage}
              variant="outline"
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {t.saveAsImage || "Save as Image"}
            </Button>
            </div>
        </CardContent>
      </Card>
    </div>
    </LiffLayout>
  )
}
