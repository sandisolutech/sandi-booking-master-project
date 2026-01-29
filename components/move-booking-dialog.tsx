"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { getTodayInThailand, formatDateForDB } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangleIcon,
  ArrowRight,
  Loader2,
  Users
} from "lucide-react"
import { format, isSameDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"

import { getAllRooms, type Room } from "@/app/admin/rooms/actions"
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { getBookings, moveBooking } from "@/app/admin/bookings/actions"
import { BOOKING_STATUS, BOOKING_STATUS_COLORS, type Booking } from "@/app/admin/bookings/types"

interface MoveBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  onBookingMoved: () => void
}

interface ConflictingBooking {
  id: number
  name: string
  booking_number: string
  status: string
  time_slot_start_time: string
  time_slot_end_time: string
  company_name?: string
  custom_company_name?: string
  room_name?: string
}

export function MoveBookingDialog({ isOpen, onClose, booking, onBookingMoved }: MoveBookingDialogProps) {
  const { toast } = useToast()
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("")
  
  // Data state
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeRound[]>([])
  const [conflictingBookings, setConflictingBookings] = useState<ConflictingBooking[]>([])
  const [allBookingsForDate, setAllBookingsForDate] = useState<ConflictingBooking[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeRound[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [checkingConflicts, setCheckingConflicts] = useState(false)
  const [moving, setMoving] = useState(false)

  // Initialize form with current booking data
  useEffect(() => {
    if (booking && isOpen) {
      setSelectedDate(new Date(booking.selected_date))
      setSelectedRoomId(String(booking.selected_room_id))
      setSelectedTimeSlotId(String(booking.selected_time_slot_id))
    }
  }, [booking, isOpen])

  // Load rooms and time slots
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [roomsData, timeSlotsData] = await Promise.all([
        getAllRooms(),
        getAllTimeRounds()
      ])
      setRooms(roomsData)
      setTimeSlots(timeSlotsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load rooms and time slots",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check for conflicts when date, room, or time slot changes
  useEffect(() => {
    if (selectedDate && selectedRoomId && timeSlots.length > 0) {
      checkConflicts()
    }
  }, [selectedDate, selectedRoomId, timeSlots])

  // Fetch all bookings for the selected date (independent of room selection)
  useEffect(() => {
    if (selectedDate) {
      fetchAllBookingsForDate()
    }
  }, [selectedDate])

  const fetchAllBookingsForDate = async () => {
    if (!selectedDate) return
    
    setCheckingConflicts(true)
    try {
      // Fetch all bookings for the selected date (all rooms)
      const { bookings: allBookings } = await getBookings({
        startDate: formatDateForDB(selectedDate),
        endDate: formatDateForDB(selectedDate),
      })

      // Filter out the current booking being moved
      const otherBookings = allBookings.filter(b => b.id !== booking?.id)
      
      // Transform to display format
      const allBookingsFormatted: ConflictingBooking[] = otherBookings.map(b => {
        // custom_field_data is already parsed from getBookingCustomFieldValues
        let customFieldData = b.custom_field_data || {}
        
        // Find room name
        const room = rooms.find(r => r.id === parseInt(String(b.selected_room_id)))
        
        // Try to find name field in custom field data
        let name = b.booking_number
        try {
          const nameEntry = Object.values(customFieldData).find((field: any) => 
            field && typeof field === 'object' && 
            field.title && field.title.toLowerCase().includes('name') &&
            field.value
          ) as any
          if (nameEntry?.value) {
            name = nameEntry.value
          }
        } catch (e) {
          // fallback to booking_number
        }
        
        return {
          id: b.id,
          name: name,
          booking_number: b.booking_number,
          status: b.status,
          time_slot_start_time: b.time_slot_start_time,
          time_slot_end_time: b.time_slot_end_time,
          company_name: b.company_name,
          custom_company_name: b.custom_company_name,
          room_name: room?.name,
        }
      })

      setAllBookingsForDate(allBookingsFormatted)
      
    } catch (error) {
      console.error("Error fetching all bookings for date:", error)
      setAllBookingsForDate([])
    } finally {
      setCheckingConflicts(false)
    }
  }

  const checkConflicts = async () => {
    if (!selectedDate || !selectedRoomId) return
    
    setCheckingConflicts(true)
    try {
      const { bookings: existingBookings } = await getBookings({
        roomId: selectedRoomId,
        startDate: formatDateForDB(selectedDate),
        endDate: formatDateForDB(selectedDate),
      })

      // Filter out the current booking being moved
      const otherBookings = existingBookings.filter(b => b.id !== booking?.id)
      
      // Transform to conflicting bookings format
      const conflicts: ConflictingBooking[] = otherBookings.map(b => {
        // custom_field_data is already parsed from getBookingCustomFieldValues
        let customFieldData = b.custom_field_data || {}
        
        // Find room name
        const room = rooms.find(r => r.id === parseInt(String(b.selected_room_id)))
        
        // Try to find name field in custom field data
        let name = b.booking_number
        try {
          const nameEntry = Object.values(customFieldData).find((field: any) => 
            field && typeof field === 'object' && 
            field.title && field.title.toLowerCase().includes('name') &&
            field.value
          ) as any
          if (nameEntry?.value) {
            name = nameEntry.value
          }
        } catch (e) {
          // fallback to booking_number
        }
        
        return {
          id: b.id,
          name: name,
          booking_number: b.booking_number,
          status: b.status,
          time_slot_start_time: b.time_slot_start_time,
          time_slot_end_time: b.time_slot_end_time,
          company_name: b.company_name,
          custom_company_name: b.custom_company_name,
          room_name: room?.name,
        }
      })

      setConflictingBookings(conflicts)
      // Show all time slots, not just available ones
      setAvailableTimeSlots(timeSlots)
      
    } catch (error) {
      console.error("Error checking conflicts:", error)
      setConflictingBookings([])
      setAvailableTimeSlots(timeSlots)
    } finally {
      setCheckingConflicts(false)
    }
  }

  const handleMove = async () => {
    if (!booking || !selectedDate || !selectedRoomId || !selectedTimeSlotId) return
    
    // Check if anything actually changed
    const originalDate = format(new Date(booking.selected_date), "yyyy-MM-dd")
    const newDate = format(selectedDate, "yyyy-MM-dd")
    const originalRoomId = String(booking.selected_room_id)
    const originalTimeSlotId = String(booking.selected_time_slot_id)
    
    if (originalDate === newDate && originalRoomId === selectedRoomId && originalTimeSlotId === selectedTimeSlotId) {
      toast({
        title: "No Changes",
        description: "Please select a different date, room, or time slot",
        variant: "destructive",
      })
      return
    }
    
    setMoving(true)
    try {
      await moveBooking(booking.id, {
        selected_date: format(selectedDate, "yyyy-MM-dd"),
        room_id: parseInt(selectedRoomId),
        time_slot_id: parseInt(selectedTimeSlotId),
      })
      
      toast({
        title: "Success",
        description: "Booking moved successfully",
      })
      
      onBookingMoved()
      onClose()
    } catch (error) {
      console.error("Error moving booking:", error)
      toast({
        title: "Error",
        description: "Failed to move booking",
        variant: "destructive",
      })
    } finally {
      setMoving(false)
    }
  }

  const selectedRoom = rooms.find(r => r.id === parseInt(selectedRoomId))
  const selectedTimeSlot = timeSlots.find(ts => ts.id === parseInt(selectedTimeSlotId))
  
  // Check if selected time slot has conflicts
  const hasConflict = selectedTimeSlotId && conflictingBookings.some(b => {
    const conflictTimeSlot = timeSlots.find(ts => 
      ts.startTime === b.time_slot_start_time && 
      ts.endTime === b.time_slot_end_time
    )
    return conflictTimeSlot?.id === parseInt(selectedTimeSlotId)
  })

  const getConflictForTimeSlot = (timeSlotId: number) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId)
    if (!timeSlot) return null
    
    return conflictingBookings.find(b => 
      b.time_slot_start_time === timeSlot.startTime && 
      b.time_slot_end_time === timeSlot.endTime
    )
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Move Booking: {booking.booking_number}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Left Column - Calendar and Available Time Slots */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-center">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => {
                          const today = getTodayInThailand()
                          return date < today
                        }}
                        showOutsideDays={true}
                        fixedWeeks={true}
                        className="rdp"
                        classNames={{
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
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Available Time Slots */}
                {availableTimeSlots.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Time Slots</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {availableTimeSlots.map((timeSlot) => (
                          <Button
                            key={timeSlot.id}
                            variant={selectedTimeSlotId === String(timeSlot.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlotId(String(timeSlot.id))}
                            className="text-xs justify-start"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}


                {/* Room Selection */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Select Room</h4>
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={String(room.id)}>
                            {room.name}
                            {room.capacity && (
                              <span className="text-gray-500 ml-2">({room.capacity} people)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

              </div>

              {/* Right Column - Existing Bookings for Selected Date */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        All Bookings for {format(selectedDate, 'MMM d, yyyy')}
                      </h3>
                      {checkingConflicts && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allBookingsForDate.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                          <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No bookings for this date</p>
                        </div>
                      ) : (
                        allBookingsForDate.map((booking) => {
                          const statusColor = BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] || '#6b7280'
                          
                          return (
                            <Card key={booking.id} className="border-l-4" 
                                  style={{ borderLeftColor: statusColor }}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">{booking.name}</span>
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs"
                                        style={{ 
                                          borderColor: statusColor,
                                          color: statusColor
                                        }}
                                      >
                                        {booking.status}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {booking.booking_number}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {booking.company_name || booking.custom_company_name}
                                    </div>
                                    {booking.room_name && (
                                      <div className="text-xs text-blue-600 font-medium">
                                        Room: {booking.room_name}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      {booking.time_slot_start_time} - {booking.time_slot_end_time}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            {selectedDate && selectedRoom && selectedTimeSlot && (
              <div>
                <span>
                  Moving to: {selectedRoom.name} on {format(selectedDate, 'MMM d, yyyy')} at {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </span>
                <p className="text-xs text-blue-600 mt-1">Note: Multiple bookings can be placed in the same time slot</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={moving}>
              Cancel
            </Button>
            <Button 
              onClick={handleMove} 
              disabled={!selectedDate || !selectedRoomId || !selectedTimeSlotId || moving}
            >
              {moving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
