"use client"

import { useCallback, useEffect, useState } from "react"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from "dayjs"
import "react-big-calendar/lib/css/react-big-calendar.css" // Core styles
import "react-big-calendar/lib/addons/dragAndDrop/styles.css" // Drag and Drop styles (if used later)

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingDetailsDialog } from "@/components/booking-details-dialog"
import { CreateBookingDialog } from "@/components/create-booking-dialog"
import { Loader2, AlertTriangleIcon, RefreshCw, Filter, Search } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { format, startOfMonth, endOfMonth } from "date-fns"
import type { DateRange } from "react-day-picker"

import { getAllCompanies, type Company } from "@/app/admin/companies/actions"
import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getBookings } from "@/app/admin/bookings/actions" // Import the new server action
import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from "@/app/admin/bookings/types"

// Initialize the localizer for react-big-calendar
const localizer = dayjsLocalizer(dayjs)

interface BookingEvent {
  id: number
  title: string
  start: Date
  end: Date
  color: string
  agreed_to_terms: boolean
  status: string
  name: string
  email: string
  phone?: string
  booking_number: string
  room_name: string
  company_name: string
  selected_date: string
  time_slot_start_time: string
  time_slot_end_time: string
  [key: string]: any // To hold all original booking data
}

// Custom Event component to display warning icon
const CustomEvent = ({ event }: { event: BookingEvent }) => {
  return (
    <div
      className="flex items-center p-1 text-xs overflow-hidden"
      style={{ backgroundColor: event.color, color: "#ffffff", borderRadius: "4px" }}
    >
      {!event.agreed_to_terms && <AlertTriangleIcon className="w-3 h-3 text-yellow-300 flex-shrink-0 mr-1" />}
      <div className="flex flex-col overflow-hidden">
        <span className="font-medium truncate">{event.name}</span>
        <span className="text-xs opacity-90 truncate">{event.booking_number}</span>
      </div>
    </div>
  )
}

export default function BookingCalendarPage() {
  const { t } = useLanguage()

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter state
  const [companies, setCompanies] = useState<Company[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [companyId, setCompanyId] = useState<string>("all")
  const [roomId, setRoomId] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date())

  // Booking data and loading states
  const [bookings, setBookings] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [totalBookings, setTotalBookings] = useState(0)

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
  /*  Optimized booking fetch with date range and filters              */
  /* ------------------------------------------------------------------ */
  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const { bookings: apiBookings, totalCount } = await getBookings({
          companyId: companyId !== "all" ? companyId : undefined,
          roomId: roomId !== "all" ? roomId : undefined,
          search: searchTerm.trim() || undefined,
          startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        })

        // The server action already transforms dates to ISO strings and adds color/title
        // We just need to convert them back to Date objects for react-big-calendar
        const formattedBookings = apiBookings.map((booking) => ({
          ...booking,
          start: new Date(booking.start),
          end: new Date(booking.end),
        }))
        if(formattedBookings.length > 0) {
          setBookings(formattedBookings)
        }
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
    [companyId, roomId, searchTerm, dateRange],
  )

  // Fetch bookings when filters or date range change
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  /* ------------------------------------------------------------------ */
  /*  Calendar event configuration                                      */
  /* ------------------------------------------------------------------ */
  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedBooking(event)
    setDetailsOpen(true)
  }

  const eventPropGetter = useCallback((event: BookingEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "4px",
        border: "none",
        color: "#ffffff",
        padding: "2px",
      },
    }
  }, [])

  const handleBookingCreated = () => {
    fetchBookings(true) // Refresh after creating
  }

  const handleRefresh = () => {
    fetchBookings(true)
  }

  // State for current view
  const [currentView, setCurrentView] = useState<string>("month")

  // Handle calendar navigation (when user navigates to different dates)
  const handleNavigate = useCallback((newDate: Date) => {
    setCalendarCurrentDate(newDate) // Update the calendar's current date
    updateDateRangeForView(newDate, currentView)
  }, [currentView])

  // Handle view changes (month, week, day)
  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view)
    updateDateRangeForView(calendarCurrentDate, view)
  }, [calendarCurrentDate])

  // Update date range based on current date and view
  const updateDateRangeForView = useCallback((date: Date, view: string) => {
    let from: Date | undefined
    let to: Date | undefined

    if (view === "month") {
      from = startOfMonth(date)
      to = endOfMonth(date)
    } else if (view === "week") {
      from = dayjs(date).startOf("week").toDate() // Use dayjs for week start/end
      to = dayjs(date).endOf("week").toDate()
    } else if (view === "day") {
      from = dayjs(date).startOf("day").toDate()
      to = dayjs(date).endOf("day").toDate()
    }
    setDateRange({ from, to })
  }, [])

  // In the `clearFilters` function, update the `setDateRange` call to reset to the current month based on the calendar's current date
  const clearFilters = () => {
    setCompanyId("all")
    setRoomId("all")
    setSearchTerm("")
    updateDateRangeForView(calendarCurrentDate, currentView)
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.bookingCalendar}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalBookings} {totalBookings === 1 ? "booking" : "bookings"} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>{t.createBooking}</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {t.filters}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="space-y-2">
            <Label htmlFor="search-filter">{t.searchBookings}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-filter"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* First row: Company and Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-filter">{t.company}</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="company-filter">
                  <SelectValue placeholder={t.allCompanies} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCompanies}</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-filter">{t.room}</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger id="room-filter">
                  <SelectValue placeholder={t.allRooms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allRooms}</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="relative p-2 md:p-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading bookings...</p>
              </div>
            </div>
          )}

          <div className="h-[600px] md:h-[700px]">
            {/* In the <Calendar> component (react-big-calendar), add the `date` and `onNavigate` props: */}
            <Calendar
              localizer={localizer}
              events={bookings}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day"]}
              view={currentView}
              defaultView="month"
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
              components={{
                event: CustomEvent, // Use the custom event component
              }}
              date={calendarCurrentDate} // Control the calendar's displayed date
              onNavigate={handleNavigate} // Capture navigation events to update dateRange
              onView={handleViewChange} // Handle view changes properly
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: BOOKING_STATUS_COLORS[BOOKING_STATUS.CONFIRMED] }}
              ></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: BOOKING_STATUS_COLORS[BOOKING_STATUS.PENDING] }}
              ></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: BOOKING_STATUS_COLORS[BOOKING_STATUS.CANCELLED] }}
              ></div>
              <span>Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: BOOKING_STATUS_COLORS[BOOKING_STATUS.REJECTED] }}
              ></div>
              <span>Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
              <span>Terms not agreed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BookingDetailsDialog isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} booking={selectedBooking} />

      <CreateBookingDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  )
}
