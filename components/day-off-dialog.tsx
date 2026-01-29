"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { addRoomDayOff, updateRoomDayOff, type RoomDayOff } from "@/app/admin/rooms/actions"
import { useToast } from "@/components/ui/use-toast"
import type { DayOffDTO } from "@/lib/dayoff-adaptor"
import { formatDateForAPI } from "@/lib/dayoff-adaptor"

export interface DayOffDialogProps {
  isOpen: boolean
  roomId: number
  editingDayOff?: DayOffDTO | null
  selectedDate?: Date | null
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
}

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export function DayOffDialog({
  isOpen,
  roomId,
  editingDayOff,
  selectedDate,
  onSuccess,
  onOpenChange,
}: DayOffDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [recurrenceType, setRecurrenceType] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('once')
  const [dayOffDate, setDayOffDate] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Initialize form with editing data
  useEffect(() => {
    if (editingDayOff) {
      setRecurrenceType(editingDayOff.recurrenceType)
      setReason(editingDayOff.reason || '')

      if (editingDayOff.dayOffDate) {
        const date = new Date(editingDayOff.dayOffDate)
        const dateString = formatDateForAPI(date)
        setDayOffDate(dateString)
      }

      if (editingDayOff.dayOfWeek !== null && editingDayOff.dayOfWeek !== undefined) {
        setDayOfWeek(editingDayOff.dayOfWeek.toString())
      }
    } else {
      // Reset form for new entry
      setRecurrenceType('once')
      setDayOffDate('')
      setDayOfWeek('')
      setReason('')
      
      // If selectedDate is provided, pre-fill the date
      if (selectedDate) {
        const dateString = formatDateForAPI(selectedDate)
        setDayOffDate(dateString)
      }
    }
    setError('')
  }, [editingDayOff, selectedDate, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (recurrenceType === 'once' && !dayOffDate) {
      setError('Please select a date')
      return
    }

    if (recurrenceType !== 'once' && dayOfWeek === '') {
      setError('Please select a day')
      return
    }

    setIsSubmitting(true)

    try {
      const dayOffData: Partial<RoomDayOff> = {
        roomId,
        recurrenceType,
        reason: reason || null,
        isActive: true,
      }

      if (recurrenceType === 'once' && dayOffDate) {
        dayOffData.dayOffDate = dayOffDate as any
        dayOffData.dayOfWeek = null
      } else if (dayOfWeek !== '') {
        dayOffData.dayOfWeek = parseInt(dayOfWeek)
        dayOffData.dayOffDate = null as any
      }

      if (editingDayOff) {
        // Update existing day off
        await updateRoomDayOff(editingDayOff.id, dayOffData)
        toast({
          title: 'Success',
          description: 'Day off updated successfully',
        })
      } else {
        // Add new day off
        await addRoomDayOff(roomId, dayOffData as any)
        toast({
          title: 'Success',
          description: 'Day off added successfully',
        })
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error('Error saving day off:', err)
      const message = err instanceof Error ? err.message : 'Failed to save day off'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingDayOff ? 'Edit Day Off' : 'Add Day Off'}</DialogTitle>
          <DialogDescription>
            {editingDayOff
              ? 'Update the day off settings'
              : 'Create a new day off for this room'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Recurrence Type */}
          <div className="space-y-2">
            <Label htmlFor="recurrence-type">Type (ประเภท)</Label>
            <Select
              value={recurrenceType}
              onValueChange={(value: any) => {
                setRecurrenceType(value)
                setError('')
              }}
            >
              <SelectTrigger id="recurrence-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">
                  วันเดียว (Single Day)
                </SelectItem>
                <SelectItem value="weekly">
                  ทุกสัปดาห์ (Weekly)
                </SelectItem>
                <SelectItem value="monthly">
                  ทุกเดือน (Monthly)
                </SelectItem>
                <SelectItem value="yearly">
                  ทุกปี (Yearly)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {recurrenceType === 'once' && 'Applicable for this specific date only'}
              {recurrenceType === 'weekly' && 'Applicable every week on this day'}
              {recurrenceType === 'monthly' && 'Applicable on this day of every month (e.g., 15th of each month)'}
              {recurrenceType === 'yearly' && 'Applicable every year on this date'}
            </p>
          </div>

          {/* Date field - shown only for 'once' type */}
          {recurrenceType === 'once' && (
            <div className="space-y-2">
              <Label htmlFor="day-off-date">วันที่ (Date)</Label>
              <Input
                id="day-off-date"
                type="date"
                value={dayOffDate}
                onChange={(e) => {
                  setDayOffDate(e.target.value)
                  setError('')
                }}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Day of week selector - shown for recurring types */}
          {recurrenceType !== 'once' && (
            <div className="space-y-2">
              <Label htmlFor="day-of-week">
                {recurrenceType === 'monthly' ? 'Date in Month' : 'Day of Week'} (วัน)
              </Label>
              <Select
                value={dayOfWeek}
                onValueChange={(value) => {
                  setDayOfWeek(value)
                  setError('')
                }}
              >
                <SelectTrigger id="day-of-week">
                  <SelectValue placeholder="Select a day..." />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceType === 'monthly' ? (
                    // Show dates 1-31 for monthly
                    Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))
                  ) : (
                    // Show days of week for weekly/yearly
                    THAI_DAYS.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผล (Reason) - Optional</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Public Holiday, Maintenance, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Form actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Saving...' : editingDayOff ? 'Update Day Off' : 'Add Day Off'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
