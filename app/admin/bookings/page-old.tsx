"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, User, CheckCircle, XCircle, Edit, Trash2, Filter, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertTriangleIcon } from "lucide-react"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, startOfMonth, endOfMonth, eachWeekOfInterval } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import type { DateRange } from "react-day-picker"

import { getAllCompanies, type Company } from "@/app/admin/companies/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getBookings } from "@/app/admin/bookings/actions"
import { BOOKING_STATUS, BOOKING_STATUS_COLORS, type Booking } from "@/app/admin/bookings/types"
import { BookingDetailsDialog } from "@/components/booking-details-dialog"
import { CreateBookingDialog } from "@/components/create-booking-dialog"
import "./calendar.css"

// Enhanced booking interface for calendar display
interface BookingEvent extends Booking {
  time: string // formatted display time
  parsedCustomFieldData?: any // parsed JSON data
}

type ViewMode = 'week' | 'month'

export default function BookingCalendarPage() {
  const { t } = useLanguage()
  
  // Date and view state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Filter state
  const [companies, setCompanies] = useState<Company[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [companyId, setCompanyId] = useState<string>("all")
  const [roomId, setRoomId] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Data state
  const [bookings, setBookings] = useState<BookingEvent[]>([])
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [totalBookings, setTotalBookings] = useState(0)

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")

  // Date range for data fetching
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

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
  /*  Fetch bookings with filters and date range                       */
  /* ------------------------------------------------------------------ */
  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
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

        // Transform bookings for calendar display
        const formattedBookings: BookingEvent[] = apiBookings.map((booking) => {
          // Parse custom field data if exists
          let parsedCustomFieldData = null
          if (booking.custom_field_data) {
            try {
              parsedCustomFieldData = JSON.parse(booking.custom_field_data)
            } catch (e) {
              console.warn('Failed to parse custom field data:', e)
            }
          }

          // Extract name from custom field data or use booking number as fallback
          const name = parsedCustomFieldData?.name || booking.booking_number
          
          return {
            ...booking,
            time: `${booking.time_slot_start_time || '00:00'} - ${booking.time_slot_end_time || '00:00'}`,
            name: name,
            parsedCustomFieldData,
            // For compatibility with existing component
            type: booking.room_name || 'Booking',
          }
        })

        setBookings(formattedBookings)
        setTotalBookings(formattedBookings.length)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setBookings([])
        setTotalBookings(0)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [companyId, roomId, statusFilter, searchTerm, dateRange],
  )

  // Fetch bookings when filters or date range change
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Get bookings for selected date
  const selectedDateBookings = bookings.filter(booking => 
    isSameDay(new Date(booking.selected_date), selectedDate)
  )

  // Get dates with bookings for calendar indicators
  const daysWithBookings = bookings.reduce((acc, booking) => {
    const bookingDate = new Date(booking.selected_date)
    if (!acc.some(date => isSameDay(date, bookingDate))) {
      acc.push(bookingDate)
    }
    return acc
  }, [] as Date[])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleBookingClick = (booking: BookingEvent) => {
    setSelectedBookingForDetails(booking)
    setActiveTab("calendar")
  }

  const handleRefresh = () => {
    fetchBookings(true)
  }

  const handleBookingCreated = () => {
    fetchBookings(true) // Refresh after creating
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : subDays(prev, 7))
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'next') {
          newDate.setMonth(newDate.getMonth() + 1)
        } else {
          newDate.setMonth(newDate.getMonth() - 1)
        }
        return newDate
      })
    }
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'week' ? 'month' : 'week')
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
    setDateRange({ from, to })
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1 p-6">
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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                {t.createBooking || "Create Booking"}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-filter">Company</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
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
                  <Select value={roomId} onValueChange={setRoomId}>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={BOOKING_STATUS.CONFIRMED}>Confirmed</SelectItem>
                      <SelectItem value={BOOKING_STATUS.PENDING}>Pending</SelectItem>
                      <SelectItem value={BOOKING_STATUS.CANCELLED}>Cancelled</SelectItem>
                      <SelectItem value={BOOKING_STATUS.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="search-filter">Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-filter"
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
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
                <div className="text-xs text-gray-500">
                  {viewMode === 'week' ? 'Switch to month view for full calendar' : 'Switch to week view for detailed view'}
                </div>
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
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading bookings...</p>
                  </div>
                </div>
              )}
              
              {!loading && selectedDateBookings.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings for this date</p>
                </div>
              )}
              
              {!loading && selectedDateBookings.map((booking) => {
                const statusColor = BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280'
                return (
                  <Card key={booking.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleBookingClick(booking)}>
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
                            <h4 className="font-semibold text-gray-900">{booking.name}</h4>
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white p-6">
          {/* Tab Content */}
          {activeTab === "filter" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>All Types</option>
                    <option>Health Checkup</option>
                    <option>Consultation</option>
                    <option>Vaccination</option>
                  </select>
                </div>
                <Button className="w-full">Apply Filters</Button>
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Search Bookings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter patient name..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <Button className="w-full">Search</Button>
              </div>
            </div>
          )}

          {activeTab === "calendar" && selectedBookingForDetails && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Booking Number</div>
                      <div className="font-medium">{selectedBookingForDetails.booking_number}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Name</div>
                      <div className="font-medium">{selectedBookingForDetails.name}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Room</div>
                      <div className="font-medium">{selectedBookingForDetails.room_name}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Company</div>
                      <div className="font-medium">
                        {selectedBookingForDetails.company_name || selectedBookingForDetails.custom_company_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="font-medium">
                        {format(new Date(selectedBookingForDetails.selected_date), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Time</div>
                      <div className="font-medium">
                        {selectedBookingForDetails.time_slot_start_time} - {selectedBookingForDetails.time_slot_end_time}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="flex items-center gap-1">
                        {selectedBookingForDetails.status === BOOKING_STATUS.CONFIRMED ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                        <span 
                          className="font-medium capitalize"
                          style={{ 
                            color: BOOKING_STATUS_COLORS[selectedBookingForDetails.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280'
                          }}
                        >
                          {selectedBookingForDetails.status}
                        </span>
                      </div>
                    </div>

                    {selectedBookingForDetails.parsedCustomFieldData && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Additional Info</div>
                        <div className="text-sm">
                          {Object.entries(selectedBookingForDetails.parsedCustomFieldData)
                            .filter(([key]) => key !== 'name')
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 capitalize">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {!selectedBookingForDetails.agreed_to_terms && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                        <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">Terms not agreed</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Move
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
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
                        {bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="font-medium">
                        {bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "calendar" && !selectedBookingForDetails && (
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
                        {bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="font-medium">
                        {bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length}
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
      />
    </div>
  )
}
