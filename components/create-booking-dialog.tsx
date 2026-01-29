"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { getAllCompanies, type Company } from "@/app/admin/companies/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getActiveCustomFields, type CustomField } from "@/app/admin/settings/custom-fields/actions"
import { createBooking } from "@/app/register/actions" // Reusing the action from register page
import { BOOKING_STATUS, type BookingStatus } from "@/app/admin/bookings/types"
import { DynamicFormField } from "@/components/dynamic-form-field"
import { checkTimeSlotAvailability, type TimeSlotAvailability, isRoomDayOff, getRoomDayOffInfo } from "@/app/register/booking-availability"
import { formatDateForDB, getTodayInThailand, addDaysInThailand } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface CreateBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  onBookingCreated?: () => void // Optional for dummy version
  initialDate?: Date // Pre-selected date when opening the dialog
}

export function CreateBookingDialog({ isOpen, onClose, onBookingCreated, initialDate }: CreateBookingDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [status, setStatus] = useState<BookingStatus>(BOOKING_STATUS.PENDING)
  const [companyId, setCompanyId] = useState<string>("")

  const [companies, setCompanies] = useState<Company[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<TimeSlotAvailability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [showFullSlotWarning, setShowFullSlotWarning] = useState(false)
  const [confirmingFullSlot, setConfirmingFullSlot] = useState(false)
  const [dayOffDates, setDayOffDates] = useState<Set<number>>(() => new Set())
  const [selectedDateDayOffInfo, setSelectedDateDayOffInfo] = useState<{ isDayOff: boolean; reason?: string; recurrenceType?: string } | null>(null)
  const [loadingDayOffs, setLoadingDayOffs] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedCompanies, fetchedRooms, fetchedTimeRounds, activeCustomFields] = await Promise.all([
        getAllCompanies(),
        getAllRooms(),
        getAllTimeRounds(),
        getActiveCustomFields(),
      ])
      setCompanies(fetchedCompanies)
      setRooms(fetchedRooms)
      setTimeRounds(fetchedTimeRounds)
      setCustomFields(activeCustomFields)
      
      // Set first company as default if available
      if (fetchedCompanies.length > 0 && !companyId) {
        setCompanyId(String(fetchedCompanies[0].id))
      }
      
      // Set first room as default if available
      if (fetchedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(String(fetchedRooms[0].id))
      }
    }
    fetchData()
  }, [])

  // Update selected date when initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate)
    }
  }, [initialDate])

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
      loadTimeSlotAvailability(selectedDate, selectedRoomId || undefined)
    }
  }, [selectedDate, selectedRoomId])

  // Load day offs for selected room
  useEffect(() => {
    const loadDayOffs = async () => {
      if (!selectedRoomId) {
        setDayOffDates(new Set())
        setLoadingDayOffs(false)
        return
      }
      
      setLoadingDayOffs(true)
      try {
        const daysOffSet = new Set<number>()
        
        // Check for next 30 days
        const today = getTodayInThailand()
        for (let i = 0; i < 30; i++) {
          const checkDate = addDaysInThailand(today, i)
          const isDayOff = await isRoomDayOff(selectedRoomId, checkDate)
          if (isDayOff) {
            daysOffSet.add(checkDate.getTime())
          }
        }
        
        setDayOffDates(daysOffSet)
      } catch (error) {
        console.error("Failed to load day offs:", error)
        setDayOffDates(new Set())
      } finally {
        setLoadingDayOffs(false)
      }
    }
    
    loadDayOffs()
  }, [selectedRoomId])

  // Check if selected date is a day off
  useEffect(() => {
    const checkSelectedDateDayOff = async () => {
      if (selectedDate && selectedRoomId) {
        const info = await getRoomDayOffInfo(selectedRoomId, selectedDate)
        if (info?.isDayOff) {
          setSelectedDateDayOffInfo(info)
          setSelectedTimeSlotId("") // Clear time slot selection
        } else {
          setSelectedDateDayOffInfo(null)
        }
      }
    }
    
    checkSelectedDateDayOff()
  }, [selectedDate, selectedRoomId])

  // Check if selected time slot is full and show warning
  useEffect(() => {
    if (selectedTimeSlotId && timeSlotAvailability.length > 0) {
      const selectedSlotAvailability = timeSlotAvailability.find(a => a.timeSlotId === parseInt(selectedTimeSlotId))
      setShowFullSlotWarning(selectedSlotAvailability ? !selectedSlotAvailability.isAvailable : false)
    } else {
      setShowFullSlotWarning(false)
    }
  }, [selectedTimeSlotId, timeSlotAvailability])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form fields when dialog closes
      setCustomFieldData({})
      setCustomFieldErrors({})
      setSelectedDate(initialDate) // Reset to initial date if provided
      setSelectedTimeSlotId("")
      setAgreedToTerms(false)
      setStatus(BOOKING_STATUS.PENDING)
      setTimeSlotAvailability([])
      setShowFullSlotWarning(false)
      setConfirmingFullSlot(false)
      // Reset to first company if available
      if (companies.length > 0) {
        setCompanyId(String(companies[0].id))
      } else {
        setCompanyId("")
      }
      // Reset to first room if available
      if (rooms.length > 0) {
        setSelectedRoomId(String(rooms[0].id))
      } else {
        setSelectedRoomId("")
      }
    }
  }, [isOpen, initialDate, companies, rooms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!selectedDate || !selectedRoomId || !selectedTimeSlotId) {
      toast({
        title: t.error,
        description: t.pleaseFillAllRequiredFields,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Check if selected date is a day off
    if (selectedDate && selectedRoomId) {
      const isDayOff = await isRoomDayOff(selectedRoomId, selectedDate)
      if (isDayOff) {
        const info = await getRoomDayOffInfo(selectedRoomId, selectedDate)
        toast({ 
          title: t.error, 
          description: `This room is closed on this date.${info?.reason ? ` Reason: ${info.reason}` : ''}`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    // Check if booking a full slot and confirm if needed
    if (showFullSlotWarning && !confirmingFullSlot) {
      setConfirmingFullSlot(true)
      setIsLoading(false)
      return
    }

    // Validate required custom fields
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
      toast({
        title: t.error,
        description: t.pleaseFillAllRequiredFields,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await createBooking({
        customFieldData: customFieldData,
        selectedDate,
        selectedRoomId,
        selectedTimeSlotId,
        customCompanyName: null,
        agreedToTerms,
        linkId: 1, // You may need to adjust this or make it dynamic
        companyId: parseInt(companyId),
        status, // Pass the selected status
        adminOverride: true // Admin can override capacity limits
      })
      if (result.success) {
        const isFullSlotBooking = showFullSlotWarning || confirmingFullSlot
        toast({
          title: t.success,
          description: isFullSlotBooking 
            ? `${result.message} (Admin override: Full slot booked)`
            : result.message,
        })
        onBookingCreated?.()
        onClose()
        // Reset form fields
        setCustomFieldData({})
        setCustomFieldErrors({})
        setSelectedDate(initialDate) // Reset to initial date if provided, otherwise undefined
        setSelectedTimeSlotId("")
        setAgreedToTerms(false)
        setStatus(BOOKING_STATUS.PENDING)
        setTimeSlotAvailability([])
        setShowFullSlotWarning(false)
        setConfirmingFullSlot(false)
        // Reset to first company if available
        if (companies.length > 0) {
          setCompanyId(String(companies[0].id))
        } else {
          setCompanyId("")
        }
        // Reset to first room if available
        if (rooms.length > 0) {
          setSelectedRoomId(String(rooms[0].id))
        } else {
          setSelectedRoomId("")
        }
      } else {
        toast({
          title: t.error,
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || t.failedToCreateBooking,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t.createBooking}</DialogTitle>
          <DialogDescription>{t.manuallyAddANewBooking}</DialogDescription>
        </DialogHeader>
        {onBookingCreated ? (
          <>
            <div className="flex-1 overflow-y-auto pr-2 dialog-scroll">
              <form id="booking-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
              {/* Dynamic Custom Fields */}
              {customFields.map((field) => (
                <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    {field.title}
                    {field.isRequired && ' *'}
                  </Label>
                  <div className="col-span-3">
                    <DynamicFormField
                      field={field}
                      value={customFieldData[field.id]}
                      onChange={(value) => {
                        setCustomFieldData(prev => ({ ...prev, [field.id]: value }))
                        // Clear error when user starts typing
                        if (customFieldErrors[field.id]) {
                          setCustomFieldErrors(prev => ({ ...prev, [field.id]: '' }))
                        }
                      }}
                      error={customFieldErrors[field.id]}
                    />
                  </div>
                </div>
              ))}
              
              {/* Company selection hidden (none display) */}
              <div className="grid grid-cols-4 items-center gap-4" style={{ display: "none" }}>
                <Label htmlFor="company" className="text-right">
                {t.company} *
                </Label>
                <Select value={companyId} onValueChange={setCompanyId} required>
                <SelectTrigger className="col-span-3 h-11">
                  <SelectValue placeholder={t.selectCompany} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                {t.room} *
              </Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId} required>
                <SelectTrigger className="col-span-3 h-11">
                  <SelectValue placeholder={t.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right flex items-center justify-end gap-2">
                <Label htmlFor="timeSlot">
                  {t.timeSlot} *
                </Label>
                {selectedDate && !selectedDateDayOffInfo?.isDayOff && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => loadTimeSlotAvailability(selectedDate, selectedRoomId || undefined)}
                    disabled={loadingAvailability}
                    className="p-1 h-6 w-6"
                    title="Refresh availability"
                  >
                    🔄
                  </Button>
                )}
              </div>
              <div className="col-span-3">
                {selectedDateDayOffInfo?.isDayOff ? (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md border border-gray-200 text-center h-11 flex items-center justify-center">
                    Time slots not available - room is closed on this date
                  </div>
                ) : (
                  <>
                    <Select value={selectedTimeSlotId} onValueChange={setSelectedTimeSlotId} required disabled={loadingAvailability}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t.selectTimeSlot} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeRounds.map((round) => {
                          const availability = timeSlotAvailability.find(a => a.timeSlotId === round.id)
                          const isSlotFull = availability ? !availability.isAvailable : false
                          const currentBookings = availability?.currentBookings || 0
                          const bookingLimit = availability?.bookingLimit || 1
                          
                          return (
                            <SelectItem key={round.id} value={String(round.id)}>
                              <div className="flex items-center justify-between w-full">
                                <span>{`${round.startTime} - ${round.endTime}`}</span>
                                {availability && (
                                  <span className={`ml-2 text-xs ${isSlotFull ? 'text-red-500' : 'text-green-600'}`}>
                                    {isSlotFull ? `Full (${currentBookings}/${bookingLimit})` : `${bookingLimit - currentBookings} available`}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {loadingAvailability && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking availability...
                      </div>
                    )}
                    {showFullSlotWarning && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-700">
                          Warning: This time slot is at capacity. Creating this booking may result in overbooking.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {t.date} *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`col-span-3 justify-start text-left font-normal h-11 ${
                      !selectedDate ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>{t.pickADate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            {loadingDayOffs && (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-2 p-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading room schedule...
                </div>
              </div>
            )}
            {selectedDateDayOffInfo?.isDayOff && (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md border border-red-200">
                  <strong>⚠️ Room is closed on this date</strong>
                  {selectedDateDayOffInfo.reason && (
                    <p className="mt-1 text-xs">Reason: {selectedDateDayOffInfo.reason}</p>
                  )}
                  {selectedDateDayOffInfo.recurrenceType && (
                    <p className="mt-1 text-xs">
                      Type: {selectedDateDayOffInfo.recurrenceType === 'once' ? 'One-time off' : 
                             selectedDateDayOffInfo.recurrenceType === 'weekly' ? 'Every week' :
                             selectedDateDayOffInfo.recurrenceType === 'monthly' ? 'Every month' : 
                             'Every year'}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t.status}
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus)}>
                <SelectTrigger className="col-span-3 h-11">
                  <SelectValue placeholder={t.selectStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BOOKING_STATUS.PENDING}>{t.pending}</SelectItem>
                  <SelectItem value={BOOKING_STATUS.CONFIRMED}>{t.confirmed}</SelectItem>
                  <SelectItem value={BOOKING_STATUS.CANCELLED}>{t.cancelled}</SelectItem>
                  <SelectItem value={BOOKING_STATUS.REJECTED}>{t.rejected}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agreedToTerms" className="text-right">
                {t.agreedToTerms}
              </Label>
              <Checkbox
                id="agreedToTerms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                className="col-span-3"
              />
            </div>
            {timeSlotAvailability.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  💡 Admin override: You can book full time slots, but warnings will be shown for capacity issues.
                </div>
              </div>
            )}              {confirmingFullSlot && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="font-medium">Confirm Overbooking</div>
                        <div className="text-sm text-amber-700">
                          You are about to create a booking for a time slot that is at capacity. 
                          This may cause scheduling conflicts. Are you sure you want to proceed?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </form>
            </div>
            <DialogFooter className="flex-shrink-0 flex gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (confirmingFullSlot) {
                    setConfirmingFullSlot(false)
                  } else {
                    onClose()
                  }
                }}
                disabled={isLoading}
              >
                {confirmingFullSlot ? 'Back' : t.cancel}
              </Button>
              <Button 
                type="submit" 
                form="booking-form"
                disabled={isLoading || selectedDateDayOffInfo?.isDayOff}
                className={`min-w-[120px] ${
                  selectedDateDayOffInfo?.isDayOff ? 'bg-red-600 hover:bg-red-700' :
                  confirmingFullSlot ? 'bg-amber-600 hover:bg-amber-700' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.creatingBooking}
                  </>
                ) : selectedDateDayOffInfo?.isDayOff ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Room Closed
                  </>
                ) : confirmingFullSlot ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Confirm Override
                  </>
                ) : (
                  t.createBooking
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-8 text-center text-gray-600">
              {t.bookingFormPlaceholder}
            </div>
            <DialogFooter>
              <Button onClick={onClose} variant="outline">
                {t.close}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
