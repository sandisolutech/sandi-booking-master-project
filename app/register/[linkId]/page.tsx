"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Check, ExternalLink, Mail, Phone, LogIn } from "lucide-react"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "@/components/language-switcher"
import { formatDateForDB, getTodayInThailand, addDaysInThailand } from "@/lib/utils"
import { getBookingLinkByUuid, incrementClickCount, isOneTimeLinkUsed, type BookingLink } from "@/app/admin/links/actions"
import { createBooking } from "@/app/register/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getCompanyById, type Company } from "@/app/admin/companies/actions"
import { getAllCompanies } from "@/app/admin/companies/actions"
import { getGeneralConfig, type GeneralConfig } from "@/app/admin/settings/actions"
import { getActiveCustomFields, type CustomField } from "@/app/admin/settings/custom-fields/actions"
import { DynamicFormField } from "@/components/dynamic-form-field"
import { CompanyLogo } from "@/components/company-logo"
import { toast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { th } from "date-fns/locale"
import { useLiff } from "@/hooks/use-liff"
import { LiffLayout } from "@/components/liff-layout"
import { checkTimeSlotAvailability, isRoomDayOff, getRoomDayOffInfo, getRoomDayOffsForDateRange, type TimeSlotAvailability, type RoomDayOffData } from "@/app/register/booking-availability"
import { BOOKING_AHEAD_DAYS } from "@/app/register/booking-constants"

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

  // Create tomorrow's date using Thailand timezone
  const tomorrow = addDaysInThailand(getTodayInThailand(), 1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const hasIncrementedClick = useRef(false)
  const [oneTimeLinkUsed, setOneTimeLinkUsed] = useState(false)
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<TimeSlotAvailability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [dayOffDates, setDayOffDates] = useState<Set<string>>(() => new Set()) // Store day off dates as ISO date strings
  const [dayOffInfoCache, setDayOffInfoCache] = useState<Record<string, RoomDayOffData>>({}) // Cache for day-off info to avoid redundant queries
  const [selectedDateDayOffInfo, setSelectedDateDayOffInfo] = useState<{ isDayOff: boolean; reason?: string; recurrenceType?: string } | null>(null)
  const [loadingDayOffs, setLoadingDayOffs] = useState(false)

  // LIFF integration
  const { 
    isLoggedIn: isLiffLoggedIn, 
    isInClient: isLiffInClient, 
    profile: liffProfile, 
    sendBookingMessage,
    login: liffLogin,
    isLoading: isLiffLoading
  } = useLiff()

  useEffect(() => {
    // Console log to check LINE profile login status
    console.log('🔍 LINE Profile Status Debug:', {
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
        // Start loading general config and booking link in parallel
        const [settings, link] = await Promise.all([
          getGeneralConfig(),
          linkUuid ? getBookingLinkByUuid(linkUuid) : Promise.resolve(null)
        ]);
        
        setCompanySettings(settings);
        setBookingLink(link);

        if (link) {
          if (link.linkType === "oneTime") {
            const linkUsed = await isOneTimeLinkUsed(link.id);
            setOneTimeLinkUsed(linkUsed);
          }

          if (link.isActive && !hasIncrementedClick.current) {
            await incrementClickCount(linkUuid);
            hasIncrementedClick.current = true;
          }
        }

        // Load rooms, time rounds, companies, and custom fields in parallel
        const [fetchedRooms, fetchedTimeRounds, fetchedCompanies, activeCustomFields] = await Promise.all([
          getAllRooms(),
          getAllTimeRounds(),
          getAllCompanies(),
          getActiveCustomFields()
        ]);

        const activeRooms = fetchedRooms.filter((room) => room && room.status === 'active');
        setRooms(activeRooms);
        
        // Set default room to first available room
        if (activeRooms.length > 0 && !selectedRoom) {
          setSelectedRoom(activeRooms[0].id.toString());
        }

        setTimeRounds(fetchedTimeRounds.filter((round) => round && round.isActive === true));
        setAllCompanies(fetchedCompanies);

        if (!linkedCompany && fetchedCompanies.length > 0) {
          setSelectedCompanyId(fetchedCompanies[0].id.toString());
        }

        setCustomFields(activeCustomFields);

        // Load linked company if needed
        if (link && link.companyId) {
          const company = await getCompanyById(link.companyId);
          setLinkedCompany(company);
          setCompanyName(company?.name || "");
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoadingLink(false);
      }
    };

    loadData();
  }, [linkUuid])

  // Function to load time slot availability
  const loadTimeSlotAvailability = async (date: Date, roomId?: string) => {
    if (!date) return
    
    setLoadingAvailability(true)
    try {
      const availability = await checkTimeSlotAvailability(date, roomId)
      setTimeSlotAvailability(availability)
    } catch (error) {
      console.error("Failed to load time slot availability:", error)
      setTimeSlotAvailability([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  // Load availability when date or room changes
  useEffect(() => {
    if (selectedDate) {
      // Clear selected time slot when date changes to force reselection
      setSelectedTimeSlot("")
      loadTimeSlotAvailability(selectedDate, selectedRoom || undefined)
    }
  }, [selectedDate])

  // Load availability when room changes
  useEffect(() => {
    if (selectedDate && selectedRoom) {
      // Clear selected time slot when room changes to force reselection
      setSelectedTimeSlot("")
      loadTimeSlotAvailability(selectedDate, selectedRoom)
    }
  }, [selectedRoom])

  // Load day offs for selected room - OPTIMIZED: Use batch query instead of loop
  useEffect(() => {
    const loadDayOffs = async () => {
      if (!selectedRoom) {
        setDayOffDates(new Set())
        setDayOffInfoCache({})
        setLoadingDayOffs(false)
        return
      }
      
      setLoadingDayOffs(true)
      try {
        // Use batch query to load all 30 days in one database call
        const today = getTodayInThailand()
        const dayOffResults = await getRoomDayOffsForDateRange(selectedRoom, today, BOOKING_AHEAD_DAYS)
        
        // Convert results to Set of ISO date strings for easier lookup
        const daysOffSet = new Set<string>()
        const infoCache: Record<string, RoomDayOffData> = {}
        
        dayOffResults.forEach(result => {
          infoCache[result.date] = result // Cache all info for later use
          if (result.isDayOff) {
            daysOffSet.add(result.date)
          }
        })
        
        setDayOffDates(daysOffSet)
        setDayOffInfoCache(infoCache) // Update cache
      } catch (error) {
        console.error("Failed to load day offs:", error)
        setDayOffDates(new Set())
        setDayOffInfoCache({})
      } finally {
        setLoadingDayOffs(false)
      }
    }
    
    loadDayOffs()
  }, [selectedRoom])

  // Check if selected date is a day off - OPTIMIZED: Use cached data instead of new query
  useEffect(() => {
    if (selectedDate && selectedRoom) {
      const dateString = formatDateForDB(selectedDate)
      const cachedInfo = dayOffInfoCache[dateString]
      
      if (cachedInfo) {
        // Use cached data
        if (cachedInfo.isDayOff) {
          setSelectedDateDayOffInfo({
            isDayOff: true,
            reason: cachedInfo.reason,
            recurrenceType: cachedInfo.recurrenceType
          })
          setSelectedTimeSlot("") // Clear time slot selection
        } else {
          setSelectedDateDayOffInfo(null)
        }
      } else {
        // If not in cache, clear the info (shouldn't happen normally)
        setSelectedDateDayOffInfo(null)
      }
    }
  }, [selectedDate, selectedRoom, dayOffInfoCache])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedDate || !bookingLink) {
      console.error("Missing required data for booking submission.")
      setIsSubmitting(false)
      return
    }

    // Check if selected date is a day off
    if (selectedDate && selectedRoom) {
      const isDayOff = await isRoomDayOff(selectedRoom, selectedDate)
      if (isDayOff) {
        const info = await getRoomDayOffInfo(selectedRoom, selectedDate)
        toast({ 
          title: t.error, 
          description: `This room is closed on this date.${info?.reason ? ` Reason: ${info.reason}` : ''}` 
        })
        setIsSubmitting(false)
        return
      }
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

    // Check if the selected time slot is still available
    const selectedSlotAvailability = timeSlotAvailability.find(a => a.timeSlotId === parseInt(selectedTimeSlot))
    if (selectedSlotAvailability && !selectedSlotAvailability.isAvailable) {
      toast({ 
        title: t.error, 
        description: "This time slot is now full. Please select another time slot." 
      })
      setIsSubmitting(false)
      // Refresh availability
      await loadTimeSlotAvailability(selectedDate, selectedRoom || undefined)
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
        lineProfile: isLiffLoggedIn && liffProfile ? {
          userId: liffProfile.userId,
          displayName: liffProfile.displayName,
          pictureUrl: liffProfile.pictureUrl,
          statusMessage: liffProfile.statusMessage
        } : null,
      })

      if (result.success) {
        // Send confirmation message to LINE if user is in LINE app
        if (isLiffInClient && isLiffLoggedIn && companySettings) {
          try {
            const selectedRoomData = rooms.find(r => r.id.toString() === selectedRoom)
            const selectedTimeSlotData = timeRounds.find(t => t.id.toString() === selectedTimeSlot)
            
            // Get customer name from custom fields (assuming there's a name field)
            const customerName = Object.values(customFieldData).find(value => 
              typeof value === 'string' && value.trim().length > 0
            ) as string || liffProfile?.displayName || 'Customer'
            
            const messageVariables = {
              booking_number: result.bookingNumber,
              company_name: companySettings.companyName,
              date: selectedDate ? format(selectedDate, "PPP") : "",
              time_slot: selectedTimeSlotData ? `${selectedTimeSlotData.startTime} - ${selectedTimeSlotData.endTime}` : "",
              room_name: selectedRoomData?.name || "",
              customer_name: customerName,
              booking_link: `${window.location.origin}/booking/${result.bookingNumber}`,
              cancel_link: `${window.location.origin}/booking/${result.bookingNumber}`,
              support_email: companySettings.supportEmail || companySettings.companyEmail
            }
            
            await sendBookingMessage('success', messageVariables)
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
    // Use Thailand timezone for date comparisons
    const today = getTodayInThailand()
    const thirtyDaysFromNow = addDaysInThailand(today, 30)
    
    const isOutsideRange = date < today || date > thirtyDaysFromNow
    const dateString = formatDateForDB(date) // Convert to ISO date string for comparison
    const isDayOff = dayOffDates.has(dateString)
    
    return isOutsideRange || isDayOff
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
    day_disabled: "bg-red-100 text-red-600 font-semibold cursor-not-allowed hover:bg-red-100",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
  }

  if (!companySettings || loadingLink) {
    return (
      <LiffLayout showProfile={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading booking form...</p>
            </CardContent>
          </Card>
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
    <LiffLayout showProfile={isLiffLoggedIn}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {!isLiffLoggedIn && !isLiffLoading && isLiffInClient && (
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
                    {t.loginWithLine}
                  </Button>
                )}
              </div>
              <LanguageToggle />
            </div>
            <div className="flex justify-center mb-4">
              {!isLiffInClient ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 For the best experience with LINE login and messaging features
                  </p>
                  <p className="text-xs text-blue-600">
                    Open this link in the LINE app to access LINE login features
                  </p>
                </div>
              ) : !isLiffLoggedIn && !isLiffLoading ? (
                <Button
                  onClick={async () => {
                    try {
                      await liffLogin()
                      // Force a page refresh after login to update the UI state
                      window.location.reload()
                    } catch (error) {
                      console.error("Login failed:", error)
                    }
                  }}
                  className="h-10 px-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md shadow-md hover:from-green-500 hover:to-blue-600 transition-all duration-200"
                >
                  {t.loginWithLine}
                </Button>
              ) : isLiffLoading ? (
                <div className="text-sm text-gray-500">
                  {t.initializingLine}
                </div>
              ) : null}
            </div>
            <div className="flex justify-center mb-4">
              <CompanyLogo size="md" />
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
            {/* Cover Image Section */}
            {companySettings?.companyCoverImageUrl && (
              <div className="mb-6 -mx-6 -mt-6">
                <div className="w-full rounded-t-lg overflow-hidden">
                  <img 
                    src={companySettings.companyCoverImageUrl} 
                    alt="Company Cover" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
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

              <div className="space-y-2" style={{ display: "none" }}>
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
                {loadingDayOffs ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2 p-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    {t.loadingRoomSchedule}
                  </div>
                ) : (
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
                )}
                {dayOffDates.size > 0 && !loadingDayOffs && (
                  <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded-md border border-red-200">
                    🔴 {t.redDatesBlocked}
                  </div>
                )}
                {selectedDateDayOffInfo?.isDayOff && (
                  <div className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-md border border-red-200">
                    <strong>⚠️ {t.roomClosedOnDate}</strong>
                    {selectedDateDayOffInfo.reason && (
                      <p className="mt-1 text-xs">{t.dayOffReason}: {selectedDateDayOffInfo.reason}</p>
                    )}
                    {selectedDateDayOffInfo.recurrenceType && (
                      <p className="mt-1 text-xs">
                        {t.dayOffType}: {selectedDateDayOffInfo.recurrenceType === 'once' ? t.oneTimeOff : 
                               selectedDateDayOffInfo.recurrenceType === 'weekly' ? t.everyWeek :
                               selectedDateDayOffInfo.recurrenceType === 'monthly' ? t.everyMonth : 
                               t.everyYear}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">{t.room} *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.filter(room => room && typeof room === 'object').map((room) => (
                    <Card
                      key={room.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedRoom === room.id.toString()
                          ? "border-2 border-blue-600 ring-2 ring-blue-600 shadow-md"
                          : "border border-gray-200 hover:border-gray-300"
                      } ${room?.status !== 'active' ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => room?.status === 'active' && setSelectedRoom(room.id.toString())}
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{room.name}</h3>
                          {selectedRoom === room.id.toString() && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                        {room.description && <p className="text-sm text-gray-500 mt-1">{room.description}</p>}
                        {room?.status !== 'active' && <p className="text-sm text-red-500 mt-1">{t.unavailable}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timeSlot">{t.timeSlot} *</Label>
                  {selectedDate && !selectedDateDayOffInfo?.isDayOff && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => loadTimeSlotAvailability(selectedDate, selectedRoom || undefined)}
                      disabled={loadingAvailability}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      🔄 Refresh
                    </Button>
                  )}
                </div>
                {selectedDateDayOffInfo?.isDayOff ? (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    Time slots are not available - room is closed on this date
                  </div>
                ) : loadingAvailability ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Checking availability...
                  </div>
                ) : null}
                {!selectedDateDayOffInfo?.isDayOff && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {timeRounds.filter(slot => slot && typeof slot === 'object').map((slot) => {
                    const availability = timeSlotAvailability.find(a => a.timeSlotId === slot.id)
                    const isSlotFull = availability ? !availability.isAvailable : false
                    const currentBookings = availability?.currentBookings || 0
                    const bookingLimit = availability?.bookingLimit || 1
                    const isDisabled = !slot?.isActive || isSlotFull
                    
                    return (
                      <Card
                        key={slot.id}
                        className={`cursor-pointer transition-all duration-200 p-2 text-center text-sm ${
                          selectedTimeSlot === slot.id.toString()
                            ? "border-2 border-purple-600 ring-2 ring-purple-600 shadow-md bg-purple-50"
                            : isDisabled
                              ? "border border-gray-200 opacity-50 cursor-not-allowed bg-gray-50"
                              : "border border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => !isDisabled && setSelectedTimeSlot(slot.id.toString())}
                      >
                        <CardContent className="p-0 flex flex-col items-center justify-center h-full">
                          <span className={`font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                            {slot.name}
                          </span>
                          <span className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({slot.startTime} - {slot.endTime})
                          </span>
                          {!slot?.isActive && (
                            <span className="text-xs text-red-500">{t.booked}</span>
                          )}
                          {slot?.isActive && isSlotFull && (
                            <span className="text-xs text-red-500">Full ({currentBookings}/{bookingLimit})</span>
                          )}
                          {slot?.isActive && !isSlotFull && availability && (
                            <span className="text-xs text-green-600">
                              {bookingLimit - currentBookings} available
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    )                    })}
                  </div>
                )}
                {!selectedDateDayOffInfo?.isDayOff && timeSlotAvailability.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    💡 Numbers show available slots. Full time slots are disabled.
                  </div>
                )}
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
                  loadingAvailability ||
                  selectedDateDayOffInfo?.isDayOff ||
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
                  (companySettings?.bookingTerms && !agreeToTerms) ||
                  (selectedTimeSlot && timeSlotAvailability.find(a => a.timeSlotId === parseInt(selectedTimeSlot))?.isAvailable === false)
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
