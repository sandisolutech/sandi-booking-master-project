"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPin, Clock, Check, ExternalLink, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-switcher"
import { CompanyLogo } from "@/components/company-logo"
import { getGeneralConfig, type GeneralConfig } from "@/app/admin/settings/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getAllCompanies, type Company } from "@/app/admin/companies/actions"

export default function BookingSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const linkUuid = params.linkId as string
  const { t } = useLanguage()

  const [companySettings, setCompanySettings] = useState<GeneralConfig | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // Get booking details from URL params
  const bookingNumber = searchParams.get('bookingNumber')
  const selectedDate = searchParams.get('selectedDate')
  const selectedRoom = searchParams.get('selectedRoom')
  const selectedTimeSlot = searchParams.get('selectedTimeSlot')
  const influencerEmail = searchParams.get('influencerEmail')
  const approvalMode = searchParams.get('approvalMode')
  const companyForDisplay = searchParams.get('companyForDisplay')

  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMakeAnotherBooking = () => {
    router.push(`/register/${linkUuid}`)
  }

  if (loading || !companySettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const bookedRoom = rooms.find((room) => room.id.toString() === selectedRoom)
  const bookedTimeSlot = timeRounds.find((slot) => slot.id.toString() === selectedTimeSlot)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-between items-center mb-4">
            <CompanyLogo size="sm" />
            <LanguageToggle />
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            approvalMode === "auto" 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-yellow-500 to-orange-500"
          }`}>
            <Check className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {approvalMode === "auto" ? t.bookingConfirmed : t.bookingSubmitted || "Booking Submitted"}
          </CardTitle>
          <CardDescription className="text-lg">
            {approvalMode === "auto" 
              ? t.reservationSuccess 
              : (t.reservationPendingApproval || "Your reservation is pending approval")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t.date}</p>
                <p className="font-semibold text-gray-900">
                  {selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : ""}
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

          {bookingNumber && (
            <div className="text-center text-gray-700 font-semibold">
              <p>
                {t.yourBookingNumber}: <span className="text-blue-600">{bookingNumber}</span>
              </p>
            </div>
          )}

          <div className="text-center text-gray-600">
            <p>
              {t.confirmationEmailSent} {influencerEmail}
            </p>
            <p className="mt-2">
              {t.thankYou} {companySettings.companyName}!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t.bookingFor} {companyForDisplay}
            </p>
          </div>

          {/* Approval Status Information */}
          {approvalMode === "manual" && (
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t.awaitingApproval || "Awaiting Approval"}
              </h4>
              <p className="text-sm text-yellow-800">
                {t.approvalMessage || "Your booking request has been submitted and is waiting for approval. You will receive an email notification once your booking is reviewed and approved."}
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

          <Button
            onClick={handleMakeAnotherBooking}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {t.makeAnotherBooking}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
