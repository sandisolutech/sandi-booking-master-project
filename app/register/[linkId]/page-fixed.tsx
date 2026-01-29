"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Check, ExternalLink, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-switcher"
import { getBookingLinkByUuid, incrementClickCount, isOneTimeLinkUsed, type BookingLink } from "@/app/admin/links/actions"
import { createBooking } from "@/app/register/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getCompanyById, type Company } from "@/app/admin/companies/actions"
import { getAllCompanies } from "@/app/admin/companies/actions"
import { getGeneralConfig, type GeneralConfig } from "@/app/admin/settings/actions"
import { getActiveCustomFields, type CustomField } from "@/app/admin/settings/custom-fields/actions"
import { DynamicFormField } from "@/components/dynamic-form-field"
import { toast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { th } from "date-fns/locale"
import { useLiff } from "@/hooks/use-liff"
import { LiffLayout } from "@/components/liff-layout"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const linkUuid = params.linkId as string
  const { t, language } = useLanguage()

  const [companySettings, setCompanySettings] = useState<GeneralConfig | null>(null)
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null)
  const [loadingLink, setLoadingLink] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])
  const [linkedCompany, setLinkedCompany] = useState<Company | null>(null)
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})
  const [companyName, setCompanyName] = useState("")
  const [customCompanyName, setCustomCompanyName] = useState("")

  // Create tomorrow's date using local time to avoid timezone issues
  const tomorrow = (() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  })()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const hasIncrementedClick = useRef(false)
  const [oneTimeLinkUsed, setOneTimeLinkUsed] = useState(false)

  // LIFF integration
  const { 
    isLoggedIn: isLiffLoggedIn, 
    isInClient: isLiffInClient, 
    profile: liffProfile, 
    sendMessage,
    shareTargetPicker
  } = useLiff()

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await getGeneralConfig()
        setCompanySettings(settings)

        if (linkUuid) {
          const link = await getBookingLinkByUuid(linkUuid)
          setBookingLink(link)

          if (link) {
            if (link.linkType === "oneTime") {
              const linkUsed = await isOneTimeLinkUsed(link.id)
              setOneTimeLinkUsed(linkUsed)
            }

            if (link.isActive && !hasIncrementedClick.current) {
              await incrementClickCount(linkUuid)
              hasIncrementedClick.current = true
            }

            if (link.companyId) {
              const company = await getCompanyById(link.companyId)
              setLinkedCompany(company)
              setCompanyName(company?.name || "")
            }
          }
        }

        const fetchedRooms = await getAllRooms()
        setRooms(fetchedRooms.filter((room) => room.status === 'active'))

        const fetchedTimeRounds = await getAllTimeRounds()
        setTimeRounds(fetchedTimeRounds.filter((round) => round.isActive))

        const fetchedCompanies = await getAllCompanies()
        setAllCompanies(fetchedCompanies)

        if (!linkedCompany && fetchedCompanies.length > 0) {
          setSelectedCompanyId(fetchedCompanies[0].id.toString())
        }

        const activeCustomFields = await getActiveCustomFields()
        setCustomFields(activeCustomFields)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoadingLink(false)
      }
    }
    loadData()
  }, [linkUuid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedDate || !bookingLink) {
      console.error("Missing required data for booking submission.")
      setIsSubmitting(false)
      return
    }

    const newErrors: Record<string, string> = {}
    for (const field of customFields) {
      if (field.isRequired) {
        const value = customFieldData[field.id]
        if (!value || (typeof value === 'string' && value.trim() === '') || 
            (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.title} is required`
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setCustomFieldErrors(newErrors)
      toast({ title: t.error, description: t.pleaseFillAllRequiredFields })
      setIsSubmitting(false)
      return
    }

    let companyIdToUse: number | null = null
    let customCompanyNameToSend: string | null = null

    if (selectedCompanyId) {
      companyIdToUse = Number.parseInt(selectedCompanyId)
    } else if (bookingLink.companyId) {
      companyIdToUse = bookingLink.companyId
    }

    if (!companyIdToUse) {
      toast({ title: t.error, description: t.selectCompany })
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createBooking({
        customFieldData: customFieldData,
        selectedDate: selectedDate,
        selectedRoomId: selectedRoom,
        selectedTimeSlotId: selectedTimeSlot,
        customCompanyName: customCompanyNameToSend,
        agreedToTerms: agreeToTerms,
        linkId: bookingLink.id,
        companyId: companyIdToUse,
        approvalMode: bookingLink.approvalMode,
      })

      if (result.success) {
        // Send confirmation message to LINE if user is in LINE app
        if (isLiffInClient && isLiffLoggedIn && companySettings) {
          try {
            const confirmationMessage = `🎉 Booking Confirmed!\n\nBooking #: ${result.bookingNumber}\nCompany: ${companySettings.companyName}\nDate: ${selectedDate ? format(selectedDate, "PPP") : ""}\nRoom: ${rooms.find(r => r.id.toString() === selectedRoom)?.name || ""}\nTime: ${timeRounds.find(t => t.id.toString() === selectedTimeSlot)?.name || ""}\n\nThank you for your booking!`
            
            await sendMessage(confirmationMessage)
          } catch (error) {
            console.log("Could not send LINE message:", error)
          }
        }
        
        router.push(`/booking/${result.bookingNumber}`)
      } else {
        console.error("Booking failed:", result.message)
        toast({ title: t.error, description: result.message || t.errorOccurred })
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast({ title: t.error, description: t.errorOccurred })
    } finally {
      setIsSubmitting(false)
    }
  }

  const disabledDays = (date: Date) => {
    // Create today's date at midnight using local time components
    const today = new Date()
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Create date 30 days from now using local time components
    const thirtyDaysFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
    
    return date < todayAtMidnight || date > thirtyDaysFromNow
  }

  const dayPickerClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "text-muted-foreground opacity-50",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
  }

  if (!companySettings || loadingLink) {
    return (
      <LiffLayout showProfile={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </LiffLayout>
    )
  }

  if (!bookingLink || !bookingLink.isActive || (bookingLink.linkType === "oneTime" && oneTimeLinkUsed)) {
    return (
      <LiffLayout showProfile={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-end mb-4">
                <LanguageToggle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.invalidLink}</h2>
              <p className="text-gray-600">
                {bookingLink && bookingLink.linkType === "oneTime" && oneTimeLinkUsed 
                  ? t.oneTimeLinkUsed || "This one-time booking link has already been used."
                  : t.linkExpired}
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">{t.contactSupport}</p>
                <p className="text-sm text-blue-600">{companySettings?.supportEmail}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </LiffLayout>
    )
  }

  return (
    <LiffLayout showProfile={isLiffInClient && isLiffLoggedIn}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-end mb-4">
              <LanguageToggle />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">{companySettings?.companyName?.charAt(0)}</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">{companySettings?.companyName}</CardTitle>
            <CardDescription className="text-lg">{bookingLink?.name}</CardDescription>
            {companySettings?.welcomeMessage && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{companySettings.welcomeMessage}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {customFields.map((field) => (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  value={customFieldData[field.id]}
                  onChange={(value) => {
                    setCustomFieldData(prev => ({ ...prev, [field.id]: value }))
                    if (customFieldErrors[field.id]) {
                      setCustomFieldErrors(prev => ({ ...prev, [field.id]: '' }))
                    }
                  }}
                  error={customFieldErrors[field.id]}
                />
              ))}

              <div className="space-y-2">
                <Label htmlFor="companyName">{t.companyBrand} *</Label>
                {linkedCompany ? (
                  <Input
                    id="companyName"
                    value={linkedCompany.name}
                    readOnly
                    className="h-11 bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t.selectCompany} />
                    </SelectTrigger>
                    <SelectContent>
                      {allCompanies.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id.toString()}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t.date} *</Label>
                <div className="w-full h-11 flex items-center justify-start text-left font-semibold text-gray-900 border border-input bg-background rounded-md px-3 py-2">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : t.selectDate}
                </div>
                <div className="border rounded-md shadow p-2 bg-white flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                    locale={language === "th" ? th : undefined}
                    classNames={dayPickerClassNames}
                    className="w-full max-w-md"
                    showOutsideDays
                    fixedWeeks
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">{t.room} *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <Card
                      key={room.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedRoom === room.id.toString()
                          ? "border-2 border-blue-600 ring-2 ring-blue-600 shadow-md"
                          : "border border-gray-200 hover:border-gray-300"
                      } ${room.status !== 'active' ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => room.status === 'active' && setSelectedRoom(room.id.toString())}
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{room.name}</h3>
                          {selectedRoom === room.id.toString() && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                        {room.description && <p className="text-sm text-gray-500 mt-1">{room.description}</p>}
                        {room.status !== 'active' && <p className="text-sm text-red-500 mt-1">{t.unavailable}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">{t.timeSlot} *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {timeRounds.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all duration-200 p-2 text-center text-sm ${
                        selectedTimeSlot === slot.id.toString()
                          ? "border-2 border-purple-600 ring-2 ring-purple-600 shadow-md bg-purple-50"
                          : "border border-gray-200 hover:border-gray-300"
                      } ${!slot.isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => slot.isActive && setSelectedTimeSlot(slot.id.toString())}
                    >
                      <CardContent className="p-0 flex flex-col items-center justify-center h-full">
                        <span className="font-medium">{slot.name}</span>
                        <span className="text-xs text-gray-500">
                          ({slot.startTime} - {slot.endTime})
                        </span>
                        {!slot.isActive && <span className="text-xs text-red-500">{t.booked}</span>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {companySettings?.bookingTerms && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{t.termsConditions}</h4>
                    <p className="text-sm text-gray-600">{companySettings.bookingTerms}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      {t.agreeToTerms} *
                    </Label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={Boolean(
                  isSubmitting ||
                  customFields.some(field => {
                    if (!field.isRequired) return false
                    const value = customFieldData[field.id]
                    return !value || (typeof value === 'string' && value.trim() === '') || 
                           (Array.isArray(value) && value.length === 0)
                  }) ||
                  !linkedCompany && selectedCompanyId === "" ||
                  !selectedDate ||
                  selectedRoom === "" ||
                  selectedTimeSlot === "" ||
                  (companySettings?.bookingTerms && !agreeToTerms)
                )}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.processing}
                  </>
                ) : (
                  t.bookNow
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                {companySettings?.supportEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{companySettings.supportEmail}</span>
                  </div>
                )}
                {companySettings?.companyPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{companySettings.companyPhone}</span>
                  </div>
                )}
              </div>
              {companySettings?.companyWebsite && (
                <div className="mt-2">
                  <a
                    href={companySettings.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t.visitWebsite}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LiffLayout>
  )
}
