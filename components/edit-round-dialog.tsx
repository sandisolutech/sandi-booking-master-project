"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateTimeRound, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { useToast } from "@/hooks/use-toast"

interface EditRoundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeRound: TimeRound | null
}

export function EditRoundDialog({ open, onOpenChange, timeRound }: EditRoundDialogProps) {
  const [roundName, setRoundName] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [bookingLimit, setBookingLimit] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form with timeRound data when dialog opens
  useEffect(() => {
    if (timeRound && open) {
      setRoundName(timeRound.name)
      setStartTime(timeRound.startTime)
      setEndTime(timeRound.endTime)
      setBookingLimit(timeRound.bookingLimit)
      setIsActive(timeRound.isActive)
    }
  }, [timeRound, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!timeRound) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("name", roundName)
    formData.append("startTime", startTime)
    formData.append("endTime", endTime)
    formData.append("bookingLimit", bookingLimit.toString())
    if (isActive) formData.append("isActive", "on")

    const result = await updateTimeRound(timeRound.id, formData)

    if (result.success) {
      toast({
        title: "Success!",
        description: `Time round "${roundName}" updated successfully.`,
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update time round.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  const generateRoundName = () => {
    if (startTime && endTime) {
      // Simple way to get a unique-ish name, could be improved
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setRoundName(`Round ${startTime}-${endTime} (${hours}:${minutes})`)
    }
  }

  if (!timeRound) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Time Round</DialogTitle>
          <DialogDescription>Update the time slot configuration and booking settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>

          {/* Round Name */}
          <div className="space-y-2">
            <Label htmlFor="roundName">Round Name *</Label>
            <div className="flex gap-2">
              <Input
                id="roundName"
                placeholder="e.g., Round 1: 9:00-10:00"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                required
              />
              <Button type="button" variant="outline" onClick={generateRoundName} disabled={!startTime || !endTime}>
                Auto
              </Button>
            </div>
            <p className="text-xs text-gray-500">Click "Auto" to generate a name based on the time range</p>
          </div>

          {/* Booking Limit */}
          <div className="space-y-2">
            <Label htmlFor="bookingLimit">Booking Limit *</Label>
            <Input
              id="bookingLimit"
              type="number"
              min="1"
              max="100"
              value={bookingLimit}
              onChange={(e) => setBookingLimit(parseInt(e.target.value) || 1)}
              required
            />
            <p className="text-xs text-gray-500">Maximum number of bookings allowed for this time slot</p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-xs text-gray-500">When inactive, this time slot won't be available for booking</p>
            </div>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Preview */}
          {startTime && endTime && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> This time slot will {isActive ? "be" : "not be"} available for booking across all active rooms with a limit of {bookingLimit} booking{bookingLimit !== 1 ? 's' : ''} per slot.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!roundName.trim() || !startTime || !endTime || bookingLimit < 1 || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update Round"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
