"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { parseISO, isValid } from "date-fns"
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { updateBookingStatus } from "@/app/admin/bookings/actions"
import { BOOKING_STATUS, type BookingStatus } from "@/app/admin/bookings/types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"



interface BookingDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  booking: any | null // Using 'any' for mock data, will be more specific with real data
}

export function BookingDetailsDialog({ isOpen, onClose, booking }: BookingDetailsDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  
  if (!booking) return null

  // Helper function to safely convert value to string
  const safeValue = (value: any): string => {
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

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!booking?.id) return
    
    setIsUpdating(true)
    try {
      await updateBookingStatus(booking.id, status)
      toast({
        title: "Success",
        description: `Booking status updated to ${status}`,
      })
      onClose()
      // You might want to refresh the bookings list here
      window.location.reload() // Simple refresh - you can replace with a more elegant solution
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
      
      if (!isValid(date)) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.bookingDetails}</DialogTitle>
          <DialogDescription>
            {t.viewDetailsFor} <span className="font-medium">{booking.title}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto flex-1 pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.bookingNumber}</Label>
            <div className="col-span-3 font-mono text-sm">{booking.booking_number}</div>
          </div>
          {/* Dynamic Custom Fields */}
          {booking.custom_field_data && Object.keys(booking.custom_field_data).length > 0 && (
            <>
          <div className="grid grid-cols-1 items-center gap-4">
                <h4 className="font-medium text-gray-900 mb-2">Booking Information</h4>
              </div>
              {Object.entries(booking.custom_field_data).map(([fieldId, fieldData]: [string, any]) => {
                if (!fieldData || !fieldData.value) return null
                
                const displayValue = safeValue(fieldData.value)
                
                return (
                  <div key={fieldId} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">{fieldData.title}:</Label>
                    <div className="col-span-3">
                      {fieldData.fieldType === 'email' ? (
                        <a href={`mailto:${displayValue}`} className="text-blue-600 hover:underline">
                          {displayValue}
                        </a>
                      ) : fieldData.fieldType === 'tel' ? (
                        <a href={`tel:${displayValue}`} className="text-blue-600 hover:underline">
                          {displayValue}
                        </a>
                      ) : fieldData.fieldType === 'url' ? (
                        <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {displayValue}
                        </a>
                      ) : fieldData.fieldType === 'color' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: displayValue }} />
                          <span className="font-mono text-sm">{displayValue}</span>
                        </div>
                      ) : fieldData.fieldType === 'date' ? (
                        <span>{safeFormat(displayValue, true)}</span>
                      ) : fieldData.fieldType === 'multiple_select' && Array.isArray(fieldData.value) ? (
                        <div className="flex flex-wrap gap-1">
                          {fieldData.value.map((item: any, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-sm text-xs">
                              {safeValue(item)}
                            </span>
                          ))}
                        </div>
                      ) : fieldData.fieldType === 'textarea' ? (
                        <div className="whitespace-pre-wrap break-words text-sm">{displayValue}</div>
                      ) : (
                        <span>{displayValue}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.company}</Label>
            <div className="col-span-3">{booking.company_name || booking.custom_company_name || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.room}</Label>
            <div className="col-span-3">{booking.room_name}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.date}</Label>
            <div className="col-span-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span>{booking.selected_date ? safeFormat(booking.selected_date, true) : "No date"}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.timeSlot}</Label>
            <div className="col-span-3 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span>{booking.time_slot_start_time} - {booking.time_slot_end_time}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.status}</Label>
            <div className="col-span-3">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: booking.color }}
              >
                {booking.status}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.agreedToTerms}</Label>
            <div className="col-span-3 flex items-center gap-2">
              {booking.agreed_to_terms ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500" />
              )}
              <span>{booking.agreed_to_terms ? t.yes : t.no}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t.createdAt}</Label>
            <div className="col-span-3 text-sm text-gray-600">
              {booking.created_at ? safeFormat(booking.created_at) : "No date"}
            </div>
          </div>
          
          {booking.updated_at && booking.updated_at !== booking.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t.updatedAt}</Label>
              <div className="col-span-3 text-sm text-gray-600">
                {safeFormat(booking.updated_at)}
              </div>
            </div>
          )}
        </div>
        
        {/* Status Update Buttons - Fixed at bottom */}
        <div className="flex flex-col gap-3 pt-4 border-t mt-auto">
          <Label className="text-sm font-medium">Update Booking Status:</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusUpdate(BOOKING_STATUS.CONFIRMED)}
              disabled={isUpdating || booking.status === BOOKING_STATUS.CONFIRMED}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Updating..." : "Confirm"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusUpdate(BOOKING_STATUS.REJECTED)}
              disabled={isUpdating || booking.status === BOOKING_STATUS.REJECTED}
            >
              {isUpdating ? "Updating..." : "Reject"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(BOOKING_STATUS.CANCELLED)}
              disabled={isUpdating || booking.status === BOOKING_STATUS.CANCELLED}
            >
              {isUpdating ? "Updating..." : "Cancel"}
            </Button>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}
