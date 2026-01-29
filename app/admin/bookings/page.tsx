"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle, 
  Edit,
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  RefreshCw, 
  AlertTriangleIcon 
} from "lucide-react"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, startOfMonth, endOfMonth, eachWeekOfInterval, parse } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

import { getAllCompanies, type Company } from "@/app/admin/companies/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getBookings, updateBookingStatus } from "@/app/admin/bookings/actions"
import { BOOKING_STATUS, BOOKING_STATUS_COLORS, type Booking, type BookingStatus } from "@/app/admin/bookings/types"
import { BookingDetailsDialog } from "@/components/booking-details-dialog"
import { CreateBookingDialog } from "@/components/create-booking-dialog"
import { MoveBookingDialog } from "@/components/move-booking-dialog"
import "./calendar.css"

// Enhanced booking interface for calendar display
interface BookingEvent extends Booking {
  time: string // formatted display time
  parsedCustomFieldData?: any // parsed JSON data
}

type ViewMode = 'week' | 'month'

function BookingCalendarPageContent() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Date and view state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  // Filter state
  const [companies, setCompanies] = useState<Company[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [companyId, setCompanyId] = useState<string>("all")
  const [roomId, setRoomId] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("active")

  // Data state
  const [monthlyBookings, setMonthlyBookings] = useState<BookingEvent[]>([]) // For calendar dots
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingEvent[]>([]) // For daily list
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingEvent | null>(null)
  const [hoveredBooking, setHoveredBooking] = useState<BookingEvent | null>(null)
  const [monthlyLoading, setMonthlyLoading] = useState(true)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [totalBookings, setTotalBookings] = useState(0)

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")
  const [isUpdating, setIsUpdating] = useState(false)

  // Search dialog state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BookingEvent[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Date range for data fetching
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  /* ------------------------------------------------------------------ */
  /*  Initialize state from URL parameters                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const urlCompanyId = searchParams.get('company') || 'all'
    const urlRoomId = searchParams.get('room') || 'all'
    const urlStatus = searchParams.get('status') || 'active'
    const urlSearch = searchParams.get('search') || ''
    const urlDate = searchParams.get('date')
    const urlView = searchParams.get('view') as ViewMode

    setCompanyId(urlCompanyId)
    setRoomId(urlRoomId)
    setStatusFilter(urlStatus)
    setSearchTerm(urlSearch)

    if (urlDate) {
      try {
        const parsedDate = parse(urlDate, 'yyyy-MM-dd', new Date())
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate)
          setCurrentDate(parsedDate)
        }
      } catch (error) {
        console.warn('Failed to parse date from URL:', urlDate)
      }
    }

    if (urlView && (urlView === 'week' || urlView === 'month')) {
      setViewMode(urlView)
    }
  }, [searchParams])

  /* ------------------------------------------------------------------ */
  /*  Handle selected booking from URL when bookings are loaded        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const urlBookingId = searchParams.get('booking')
    if (urlBookingId && selectedDateBookings.length > 0) {
      const foundBooking = selectedDateBookings.find(booking => String(booking.id) === urlBookingId)
      if (foundBooking) {
        setSelectedBookingForDetails(foundBooking)
      }
    }
  }, [selectedDateBookings, searchParams])

  /* ------------------------------------------------------------------ */
  /*  Update URL when filters change                                    */
  /* ------------------------------------------------------------------ */
  const updateURL = useCallback((params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`
    router.push(newURL, { scroll: false })
  }, [router, searchParams])

  /* ------------------------------------------------------------------ */
  /*  Fetch filter data (companies & rooms)                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [companiesData, roomsData] = await Promise.all([getAllCompanies(), getAllRooms()])
        setCompanies(companiesData)
        setRooms(roomsData)
      } catch (error) {
        console.error("Error loading filter data:", error)
      }
    }
    loadFilters()
  }, [])

  /* ------------------------------------------------------------------ */
  /*  Fetch monthly bookings for calendar dots                         */
  /* ------------------------------------------------------------------ */
  const fetchMonthlyBookings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setMonthlyLoading(true)
      }

      try {
        const { bookings: apiBookings } = await getBookings({
          companyId: companyId !== "all" ? companyId : undefined,
          roomId: roomId !== "all" ? roomId : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm.trim() || undefined,
          startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        })
        console.log("Fetched monthly bookings:", apiBookings)
        // Transform bookings for calendar display
        const formattedBookings: BookingEvent[] = apiBookings.map((booking) => {
          // Parse custom field data if exists
          let parsedCustomFieldData = null
          if (booking.custom_field_data) {
            try {
              if (typeof booking.custom_field_data === "string") {
                parsedCustomFieldData = JSON.parse(booking.custom_field_data)
              } else {
                parsedCustomFieldData = booking.custom_field_data
              }
            } catch (e) {
              console.warn('Failed to parse custom field data:', e)
              parsedCustomFieldData = booking.custom_field_data
            }
          }

          // Extract name from custom field data or use booking number as fallback
          const name = parsedCustomFieldData?.name || booking.booking_number
          
          return {
            ...booking,
            custom_field_data: parsedCustomFieldData, // Replace with parsed data for compatibility
            time: `${booking.time_slot_start_time || '00:00'} - ${booking.time_slot_end_time || '00:00'}`,
            name: name,
            parsedCustomFieldData, // Keep for backward compatibility
            // For compatibility with existing component
            type: booking.room_name || 'Booking',
          }
        })

        setMonthlyBookings(formattedBookings)
        setTotalBookings(formattedBookings.length)
      } catch (error) {
        console.error("Error fetching monthly bookings:", error)
        setMonthlyBookings([])
        setTotalBookings(0)
      } finally {
        setMonthlyLoading(false)
        setRefreshing(false)
      }
    },
    [companyId, roomId, statusFilter, searchTerm, dateRange],
  )

  /* ------------------------------------------------------------------ */
  /*  Fetch bookings for selected date only                            */
  /* ------------------------------------------------------------------ */
  const fetchSelectedDateBookings = useCallback(
    async (date: Date) => {
      setDailyLoading(true)

      try {
        const dateStr = format(date, "yyyy-MM-dd")
        const { bookings: apiBookings } = await getBookings({
          companyId: companyId !== "all" ? companyId : undefined,
          roomId: roomId !== "all" ? roomId : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm.trim() || undefined,
          startDate: dateStr,
          endDate: dateStr,
        })
        console.log("Fetched daily bookings for", dateStr, ":", apiBookings)
        // Transform bookings for calendar display
        const formattedBookings: BookingEvent[] = apiBookings.map((booking) => {
          // Parse custom field data if exists
          let parsedCustomFieldData = null
          if (booking.custom_field_data) {
            try {
              if (typeof booking.custom_field_data === "string") {
                parsedCustomFieldData = JSON.parse(booking.custom_field_data)
              } else {
                parsedCustomFieldData = booking.custom_field_data
              }
            } catch (e) {
              console.warn('Failed to parse custom field data:', e)
              parsedCustomFieldData = booking.custom_field_data
            }
          }

          // Extract name from custom field data or use booking number as fallback
          const name = parsedCustomFieldData?.name || booking.booking_number
          
          return {
            ...booking,
            custom_field_data: parsedCustomFieldData, // Replace with parsed data for compatibility
            time: `${booking.time_slot_start_time || '00:00'} - ${booking.time_slot_end_time || '00:00'}`,
            name: name,
            parsedCustomFieldData, // Keep for backward compatibility
            // For compatibility with existing component
            type: booking.room_name || 'Booking',
          }
        })

        setSelectedDateBookings(formattedBookings)
      } catch (error) {
        console.error("Error fetching daily bookings:", error)
        setSelectedDateBookings([])
      } finally {
        setDailyLoading(false)
      }
    },
    [companyId, roomId, statusFilter, searchTerm],
  )

  // Fetch monthly bookings when filters change
  useEffect(() => {
    fetchMonthlyBookings()
  }, [fetchMonthlyBookings])
  
  // Fetch monthly bookings when date range changes
  useEffect(() => {
    fetchMonthlyBookings()
  }, [dateRange])

  // Fetch bookings for selected date when date is selected
  useEffect(() => {
    fetchSelectedDateBookings(selectedDate)
  }, [selectedDate, fetchSelectedDateBookings])

  // Get dates with bookings for calendar indicators
  const daysWithBookings = monthlyBookings.reduce((acc, booking) => {
    const bookingDate = new Date(booking.selected_date)
    if (!acc.some(date => isSameDay(date, bookingDate))) {
      acc.push(bookingDate)
    }
    return acc
  }, [] as Date[])

  const handleDateSelect = (date: Date) => {
    // setSelectedDate(date)
    updateURL({ date: format(date, 'yyyy-MM-dd') })
  }

  const handleBookingClick = (booking: BookingEvent) => {
    setSelectedBookingForDetails(booking) // Show in sidebar on hover
  }

  const handleBookingHover = (booking: BookingEvent | null) => {
    setHoveredBooking(booking)
    // if (booking) {
    //   setSelectedBookingForDetails(booking) // Show in sidebar on hover
    // }
  }

  const handleRefresh = () => {
    fetchMonthlyBookings(true)
    fetchSelectedDateBookings(selectedDate)
  }

  const handleBookingCreated = () => {
    fetchMonthlyBookings(true) // Refresh after creating
    fetchSelectedDateBookings(selectedDate)
  }

  const handleBookingMoved = () => {
    fetchMonthlyBookings(true) // Refresh after moving
    fetchSelectedDateBookings(selectedDate)
    setMoveDialogOpen(false)
  }

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!selectedBookingForDetails?.id) return
    
    setIsUpdating(true)
    try {
      await updateBookingStatus(String(selectedBookingForDetails.id), status)
      toast({
        title: "Success",
        description: `Booking status updated to ${status}`,
      })
      fetchMonthlyBookings(true) // Refresh the bookings list
      fetchSelectedDateBookings(selectedDate)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  function safeFormat(dateInput: string | Date, dateOnly = false): string {
    if (!dateInput) {
      return "";
    }
    
    try {
      let date: Date;
      
      // Handle both Date objects and strings
      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else {
        console.warn("Invalid date input type:", typeof dateInput, dateInput);
        return String(dateInput);
      }
      
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date:", dateInput);
        return String(dateInput);
      }
      
      // Format as date only or date and time
      return dateOnly ? format(date, "dd/MM/yyyy") : format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateInput);
      return String(dateInput);
    }
  }

  // Helper function to safely convert value to string
  function safeValue(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    updateURL({ company: value })
  }

  const handleRoomChange = (value: string) => {
    setRoomId(value)
    updateURL({ room: value })
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    updateURL({ status: value })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date
    if (viewMode === 'week') {
      newDate = direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7)
    } else {
      newDate = new Date(currentDate)
      if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else {
        newDate.setMonth(newDate.getMonth() - 1)
      }
    }
    setCurrentDate(newDate)
    updateURL({ date: format(newDate, 'yyyy-MM-dd') })
  }

  const toggleViewMode = () => {
    const newViewMode = viewMode === 'week' ? 'month' : 'week'
    setViewMode(newViewMode)
    updateURL({ view: newViewMode })
  }

  // Update date range based on current date and view
  const updateDateRangeForView = useCallback((date: Date, view: string) => {
    let from: Date | undefined
    let to: Date | undefined

    if (view === 'month') {
      from = startOfMonth(date)
      to = endOfMonth(date)
    } else if (view === 'week') {
      from = startOfWeek(date, { weekStartsOn: 0 })
      to = endOfWeek(date, { weekStartsOn: 0 })
    } else if (view === 'day') {
      from = date
      to = date
    }
    
    // Only update if the date range has actually changed
    setDateRange(prevRange => {
      const hasSameRange = prevRange?.from && prevRange?.to && 
        from && to &&
        prevRange.from.getTime() === from.getTime() && 
        prevRange.to.getTime() === to.getTime()
      
      if (hasSameRange) {
        return prevRange // Don't update if the range is the same
      }
      
      return { from, to }
    })
  }, [])

  // Update date range when current date or view mode changes
  useEffect(() => {
    updateDateRangeForView(currentDate, viewMode)
  }, [currentDate, viewMode, updateDateRangeForView])

  const clearFilters = () => {
    setCompanyId("all")
    setRoomId("all")
    setSearchTerm("")
    setStatusFilter("all")
    updateDateRangeForView(currentDate, viewMode)
    
    // Clear URL parameters
    updateURL({
      company: null,
      room: null,
      search: null,
      status: null
    })
  }

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    const end = endOfWeek(date, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }

  const getMonthDays = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    })
  }

  const renderDay = (day: Date) => {
    const isSelected = isSameDay(day, selectedDate)
    const isCurrentDay = isToday(day)
    const hasBooking = daysWithBookings.some(bookingDate => isSameDay(bookingDate, day))
    const isCurrentMonth = day.getMonth() === currentDate.getMonth()

    return (
      <button
        key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
        onClick={() => handleDateSelect(day)}
        className={`
          relative flex flex-col items-center justify-center p-2 text-sm transition-all duration-200 hover:bg-blue-50 rounded-lg
          ${isSelected 
            ? 'bg-blue-600 text-white font-medium shadow-md scale-105' 
            : isCurrentDay 
              ? 'bg-blue-100 text-blue-700 font-medium'
              : hasBooking && isCurrentMonth
                ? 'bg-blue-50 text-blue-600 font-medium'
                : isCurrentMonth
                  ? 'text-gray-900 hover:text-blue-600'
                  : 'text-gray-400'
          }
          ${viewMode === 'week' ? 'h-16 min-w-[80px]' : 'h-10 aspect-square'}
        `}
      >
        <span className={viewMode === 'week' ? 'text-lg' : 'text-sm'}>
          {day.getDate()}
        </span>
        {viewMode === 'week' && (
          <span className="text-xs opacity-75 mt-1">
            {format(day, 'EEE')}
          </span>
        )}
        {hasBooking && !isSelected && (
          <div className={`absolute ${viewMode === 'week' ? 'bottom-1 right-1' : 'bottom-1'} left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full`} />
        )}
      </button>
    )
  }

  const tabs = [
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "filter", label: "Filter", icon: Filter },
    { id: "search", label: "Search", icon: Search },
  ]

  const handleSearchDialogOpen = () => {
    setSearchDialogOpen(true)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleSearchResultClick = (booking: BookingEvent) => {
    // Keep search dialog open - do NOT close it
    // setSearchDialogOpen(false) // Removed this line
    
    // Set the selected date to the booking's date
    const bookingDate = new Date(booking.selected_date)
    setSelectedDate(bookingDate)
    setCurrentDate(bookingDate)
    updateURL({ date: format(bookingDate, 'yyyy-MM-dd') })
    
    // Show booking details
    setSelectedBookingForDetails(booking)
    setDetailsOpen(true)
  }

  /* ------------------------------------------------------------------ */
  /*  Search functionality                                              */
  /* ------------------------------------------------------------------ */
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        // Search across all bookings without date constraints
        const { bookings: apiBookings } = await getBookings({
          search: query.trim(),
          // Remove date constraints for global search
          startDate: undefined,
          endDate: undefined,
        })

        // Transform bookings for display
        const formattedBookings: BookingEvent[] = apiBookings.map((booking) => {
          // Parse custom field data if exists
          let parsedCustomFieldData = null
          if (booking.custom_field_data) {
            try {
              if (typeof booking.custom_field_data === "string") {
                parsedCustomFieldData = JSON.parse(booking.custom_field_data)
              } else {
                parsedCustomFieldData = booking.custom_field_data
              }
            } catch (e) {
              console.warn('Failed to parse custom field data:', e)
            }
          }

          // Extract name from custom field data or use booking number as fallback
          const name = parsedCustomFieldData?.name || booking.booking_number
          
          return {
            ...booking,
            custom_field_data: parsedCustomFieldData, // Replace with parsed data for compatibility
            time: `${booking.time_slot_start_time || '00:00'} - ${booking.time_slot_end_time || '00:00'}`,
            name: name,
            parsedCustomFieldData, // Keep for backward compatibility
            type: booking.room_name || 'Booking',
          }
        })

        setSearchResults(formattedBookings)
      } catch (error) {
        console.error("Error performing search:", error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    []
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-2 p-6 overflow-y-auto h-screen">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {t.bookingCalendar || "Booking Calendar"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalBookings} {totalBookings === 1 ? "booking" : "bookings"} found
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setSelectedDate(today)
                    setCurrentDate(today)
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Today
                </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                {t.createBooking || "Create Booking"}
              </Button>
            </div>
          </div>


          {/* Animated Week-Month Calendar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              {/* Calendar Header with Navigation and View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <h2 className="text-lg font-semibold text-gray-900 min-w-[140px]">
                    {viewMode === 'week' 
                      ? `${format(getWeekDays(currentDate)[0], 'MMM d')} - ${format(getWeekDays(currentDate)[6], 'MMM d, yyyy')}`
                      : format(currentDate, 'MMMM yyyy')
                    }
                  </h2>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleViewMode}
                    className="transition-all duration-200"
                  >
                    {viewMode === 'month' ? 'Month' : 'Week'}
                  </Button>
                  <div className="text-sm text-gray-500">
                    Selected: {format(selectedDate, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Calendar Content */}
              <div className="transition-all duration-300 ease-in-out">
                {viewMode === 'week' ? (
                  /* Week View */
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays(currentDate).map(day => renderDay(day))}
                    </div>
                  </div>
                ) : (
                  /* Month View */
                  <div className="space-y-2">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Month Days */}
                    {getMonthDays(currentDate).map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-2">
                        {week.map(day => renderDay(day))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings for Selected Date */}
          <div className="space-y-4">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
              <span className="text-sm text-blue-600">• {selectedDateBookings.length} bookings</span>
            </div>
            
            {/* Bookings List - One per row */}
            <div className="space-y-3">
              {dailyLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading bookings...</p>
                  </div>
                </div>
              )}
              
              {!dailyLoading && selectedDateBookings.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings for this date</p>
                </div>
              )}
              
              {!dailyLoading && selectedDateBookings.map((booking) => {
                const statusColor = BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280'
                const isHovered = hoveredBooking?.id === booking.id
                const isSelectedBooking = selectedBookingForDetails?.id === booking.id

                return (
                  <Card key={booking.id} 
                        className={`transition-all duration-200 cursor-pointer
                          ${isSelectedBooking ? 'ring-4 ring-blue-500 bg-blue-100/60 scale-[1.03]' : ''}
                          ${isHovered && !isSelectedBooking ? 'shadow-xl scale-[1.02] ring-2 ring-blue-200 bg-blue-50/50' : 'hover:shadow-md hover:bg-gray-50'}
                        `}
                        onClick={() => handleBookingClick(booking)}
                        onMouseEnter={() => handleBookingHover(booking)}
                        onMouseLeave={() => handleBookingHover(null)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="text-sm font-medium text-gray-900 min-w-[100px]">
                            {booking.time_slot_start_time} - {booking.time_slot_end_time}
                          </div>
                          
                          {/* Status Indicator */}
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusColor }}
                          />
                          
                          {/* Booking Details */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              {booking.name}
                              {isSelectedBooking && (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" title="Selected" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.room_name} • {booking.company_name || booking.custom_company_name}
                            </p>
                            {!booking.agreed_to_terms && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangleIcon className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-yellow-600">Terms not agreed</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge and Hover Indicator */}
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={booking.status === BOOKING_STATUS.CONFIRMED ? 'default' : 'secondary'}
                            style={{ 
                              backgroundColor: statusColor,
                              color: 'white'
                            }}
                          >
                            {booking.status === BOOKING_STATUS.CONFIRMED ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {booking.status}
                          </Badge>
                          
                          {/* Visual indicator for hover/click action */}
                          {isHovered && !isSelectedBooking && (
                            <div className="text-blue-600 text-xs font-medium">
                              Click for details
                            </div>
                          )}
                          {isSelectedBooking && (
                            <div className="text-blue-700 text-xs font-bold">Selected</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 border-l border-gray-200 bg-white p-6 fixed right-0 top-0 h-screen w-[420px] overflow-y-auto z-20">
          <Card className="mb-6 mt-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex-1">Filters</h3>
                <Button variant="outline" className="" size="sm" onClick={handleSearchDialogOpen}>
                  Search
                </Button>
                <Button variant="outline" size="sm" className="ml-2" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"  style={{ display: "none" }}>
                  <Label htmlFor="company-filter">Company</Label>
                  <Select value={companyId} onValueChange={handleCompanyChange}>
                    <SelectTrigger id="company-filter">
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-filter">Room</Label>
                  <Select value={roomId} onValueChange={handleRoomChange}>
                    <SelectTrigger id="room-filter">
                      <SelectValue placeholder="All Rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={String(room.id)}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Active Bookings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active Bookings</SelectItem>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={BOOKING_STATUS.CONFIRMED}>Confirmed</SelectItem>
                      <SelectItem value={BOOKING_STATUS.PENDING}>Pending</SelectItem>
                      <SelectItem value={BOOKING_STATUS.CANCELLED}>Cancelled</SelectItem>
                      <SelectItem value={BOOKING_STATUS.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Tab Content */}
          {selectedBookingForDetails && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDetailsOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    View Full Details
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Booking Number */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Booking Number</div>
                      <div className="font-mono text-sm font-medium">{selectedBookingForDetails.booking_number}</div>
                    </div>

                    {/* Dynamic Custom Fields */}
                    {selectedBookingForDetails.custom_field_data && Object.keys(selectedBookingForDetails.custom_field_data).length > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-xs text-gray-500 mb-2">Booking Information</div>
                        <div className="space-y-2">
                          {Object.entries(selectedBookingForDetails.custom_field_data).map(([fieldId, fieldData]: [string, any]) => {
                            if (!fieldData || !fieldData.value) return null
                            
                            const displayValue = safeValue(fieldData.value)
                            
                            return (
                              <div key={fieldId} className="flex justify-between items-start">
                                <span className="text-xs text-gray-600">{fieldData.title}:</span>
                                <div className="text-sm font-medium text-right max-w-[60%]">
                                  {fieldData.fieldType === 'email' ? (
                                    <a href={`mailto:${displayValue}`} className="text-blue-600 hover:underline truncate">
                                      {displayValue}
                                    </a>
                                  ) : fieldData.fieldType === 'tel' ? (
                                    <a href={`tel:${displayValue}`} className="text-blue-600 hover:underline">
                                      {displayValue}
                                    </a>
                                  ) : fieldData.fieldType === 'url' ? (
                                    <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                      {displayValue}
                                    </a>
                                  ) : fieldData.fieldType === 'color' ? (
                                    <div className="flex items-center gap-1 justify-end">
                                      <div className="w-3 h-3 rounded border" style={{ backgroundColor: displayValue }} />
                                      <span className="font-mono text-xs">{displayValue}</span>
                                    </div>
                                  ) : fieldData.fieldType === 'date' ? (
                                    <span className="text-sm">{safeFormat(displayValue, true)}</span>
                                  ) : fieldData.fieldType === 'multiple_select' && Array.isArray(fieldData.value) ? (
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {fieldData.value.slice(0, 2).map((item: any, index: number) => (
                                        <span key={index} className="inline-flex items-center px-1 py-0.5 bg-blue-50 text-blue-700 rounded-sm text-xs">
                                          {safeValue(item)}
                                        </span>
                                      ))}
                                      {fieldData.value.length > 2 && (
                                        <span className="text-xs text-gray-500">+{fieldData.value.length - 2}</span>
                                      )}
                                    </div>
                                  ) : fieldData.fieldType === 'textarea' ? (
                                    <div className="text-sm text-right max-w-full break-words line-clamp-2">
                                      {displayValue}
                                    </div>
                                  ) : (
                                    <span className="truncate">{displayValue}</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Basic Details */}
                    <div className="border-t pt-3 space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Company</div>
                        <div className="text-sm font-medium">
                          {selectedBookingForDetails.company_name || selectedBookingForDetails.custom_company_name || "N/A"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Room</div>
                        <div className="text-sm font-medium">{selectedBookingForDetails.room_name}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Date & Time</div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          <span>{format(new Date(selectedBookingForDetails.selected_date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{selectedBookingForDetails.time_slot_start_time} - {selectedBookingForDetails.time_slot_end_time}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={selectedBookingForDetails.status === BOOKING_STATUS.CONFIRMED ? 'default' : 'secondary'}
                            style={{ 
                              backgroundColor: BOOKING_STATUS_COLORS[selectedBookingForDetails.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280',
                              color: 'white'
                            }}
                          >
                            {selectedBookingForDetails.status === BOOKING_STATUS.CONFIRMED ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {selectedBookingForDetails.status}
                          </Badge>
                        </div>
                      </div>

                      {!selectedBookingForDetails.agreed_to_terms && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
                          <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-700">Terms not agreed</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => setMoveDialogOpen(true)}
                        >
                          Move
                        </Button>
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 mb-2">Update Status</div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusUpdate(BOOKING_STATUS.CONFIRMED)}
                            disabled={isUpdating || selectedBookingForDetails.status === BOOKING_STATUS.CONFIRMED}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            {isUpdating ? "..." : "Confirm"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(BOOKING_STATUS.REJECTED)}
                            disabled={isUpdating || selectedBookingForDetails.status === BOOKING_STATUS.REJECTED}
                            className="text-xs"
                          >
                            {isUpdating ? "..." : "Reject"}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(BOOKING_STATUS.CANCELLED)}
                          disabled={isUpdating || selectedBookingForDetails.status === BOOKING_STATUS.CANCELLED}
                          className="w-full text-xs"
                        >
                          {isUpdating ? "Updating..." : "Cancel Booking"}
                        </Button>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="border-t pt-3 text-xs text-gray-500">
                      <div>Created: {safeFormat(selectedBookingForDetails.created_at)}</div>
                      {selectedBookingForDetails.updated_at && selectedBookingForDetails.updated_at !== selectedBookingForDetails.created_at && (
                        <div>Updated: {safeFormat(selectedBookingForDetails.updated_at)}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today's Bookings</span>
                      <span className="font-medium">{selectedDateBookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium">
                        {selectedDateBookings.filter(b => b.status === BOOKING_STATUS.PENDING).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="font-medium">
                        {selectedDateBookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!selectedBookingForDetails && (
            <div className="space-y-6">
              <div className="text-center p-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a booking to view details</p>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings</span>
                      <span className="font-medium">{totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today's Bookings</span>
                      <span className="font-medium">{selectedDateBookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium">
                        {monthlyBookings.filter(b => b.status === BOOKING_STATUS.PENDING).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="font-medium">
                        {monthlyBookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <BookingDetailsDialog 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        booking={selectedBookingForDetails} 
      />

      <CreateBookingDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onBookingCreated={handleBookingCreated}
        initialDate={selectedDate}
      />

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Bookings
            </DialogTitle>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="mb-4">
            <Input 
              placeholder="Search by booking number, name, company, room, or custom field values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg p-4"
              autoFocus
            />
          </div>
          
          {/* Search Results */}
          <div className="flex-1 overflow-auto">
            {searchLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              </div>
            )}
            
            {!searchLoading && searchQuery && searchResults.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-1">Try searching by booking number, name, company, or room</p>
              </div>
            )}
            
            {!searchLoading && !searchQuery && (
              <div className="text-center p-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Start typing to search bookings...</p>
                <p className="text-sm text-gray-400 mt-1">Search by booking number, name, company, room, or custom field values</p>
              </div>
            )}
            
            {!searchLoading && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  Found {searchResults.length} booking{searchResults.length === 1 ? '' : 's'}
                </div>
                {searchResults.map((booking) => {
                  const statusColor = BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280'
                  
                  return (
                    <Card key={booking.id} 
                          className="transition-all duration-200 cursor-pointer hover:shadow-md hover:bg-gray-50"
                          onClick={() => handleSearchResultClick(booking)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Booking Number */}
                            <div className="font-mono text-sm font-medium text-blue-600 min-w-[120px]">
                              {booking.booking_number}
                            </div>
                            
                            {/* Status Indicator */}
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusColor }}
                            />
                            
                            {/* Booking Details */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{booking.name}</h4>
                              <p className="text-sm text-gray-600">
                                {booking.room_name} • {booking.company_name || booking.custom_company_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(booking.selected_date), 'MMM d, yyyy')} • {booking.time_slot_start_time} - {booking.time_slot_end_time}
                              </p>
                              {!booking.agreed_to_terms && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangleIcon className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs text-yellow-600">Terms not agreed</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={booking.status === BOOKING_STATUS.CONFIRMED ? 'default' : 'secondary'}
                              style={{ 
                                backgroundColor: statusColor,
                                color: 'white'
                              }}
                            >
                              {booking.status === BOOKING_STATUS.CONFIRMED ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Custom Field Data Preview */}
                        {booking.parsedCustomFieldData && Object.keys(booking.parsedCustomFieldData).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Custom Fields:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(booking.parsedCustomFieldData)
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <span key={key} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {key}: {String(value)}
                                  </span>
                                ))
                              }
                              {Object.keys(booking.parsedCustomFieldData).length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{Object.keys(booking.parsedCustomFieldData).length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Booking Dialog */}
      <MoveBookingDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        booking={selectedBookingForDetails}
        onBookingMoved={handleBookingMoved}
      />
    </div>
  )
}

export default function BookingCalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BookingCalendarPageContent />
    </Suspense>
  )
}
