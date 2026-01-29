"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, Clock } from 'lucide-react'
import { getRoomTimeSlotAvailability, updateRoomTimeSlotAvailabilityBatch } from '@/app/admin/rooms/actions'
import { useToast } from '@/components/ui/use-toast'
import { useLanguage } from '@/lib/language-context'

export interface TimeRound {
  id: number
  name: string
  startTime: string
  endTime: string
  isActive: boolean
}

export interface RoomTimeSlotAvailabilityProps {
  roomId: number
  timeRounds: TimeRound[]
  onSuccess?: () => void
}

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface AvailabilityState {
  [dayOfWeek: number]: {
    [timeRoundId: number]: boolean
  }
}

export function RoomTimeSlotsAvailability({
  roomId,
  timeRounds,
  onSuccess,
}: RoomTimeSlotAvailabilityProps) {
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize availability state
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setIsLoading(true)
        const existingAvailability = await getRoomTimeSlotAvailability(roomId)

        // Initialize all as available (default behavior)
        const newState: AvailabilityState = {}
        for (let day = 0; day < 7; day++) {
          newState[day] = {}
          timeRounds.forEach((round) => {
            newState[day][round.id] = true
          })
        }

        // Override with existing settings
        existingAvailability.forEach((item) => {
          if (!newState[item.dayOfWeek]) {
            newState[item.dayOfWeek] = {}
          }
          newState[item.dayOfWeek][item.timeRoundId] = item.isAvailable
        })

        setAvailabilityState(newState)
      } catch (error) {
        console.error('Error loading availability:', error)
        toast({
          title: 'Error',
          description: 'Failed to load time slot availability',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAvailability()
  }, [roomId, timeRounds, toast])

  const handleCheckboxChange = (dayOfWeek: number, timeRoundId: number, checked: boolean) => {
    setAvailabilityState((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [timeRoundId]: checked,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert state to batch update format
      const availabilityData = []
      for (let day = 0; day < 7; day++) {
        for (const timeRoundId in availabilityState[day]) {
          availabilityData.push({
            timeRoundId: parseInt(timeRoundId),
            dayOfWeek: day,
            isAvailable: availabilityState[day][parseInt(timeRoundId)],
          })
        }
      }

      await updateRoomTimeSlotAvailabilityBatch(roomId, availabilityData)
      toast({
        title: 'Success',
        description: 'Time slot availability updated successfully',
      })
      setHasChanges(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving availability:', error)
      const message = error instanceof Error ? error.message : 'Failed to save availability'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time Slot Availability (Available Time Slots)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const days = language === 'th' ? THAI_DAYS : ENGLISH_DAYS

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          {t.availableTimeSlots || 'Time Slot Availability (Available Time Slots)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Select which time slots are available for booking on each day of the week. By default, all time slots are available.
          </p>
        </div>

        {/* Days of Week Sections */}
        <div className="space-y-6">
          {days.map((dayName, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                {dayName}
              </h3>

              {timeRounds.length === 0 ? (
                <p className="text-sm text-gray-500">No time slots available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeRounds.map((round) => (
                    <div key={round.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`slot-${dayIndex}-${round.id}`}
                        checked={availabilityState[dayIndex]?.[round.id] ?? true}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(dayIndex, round.id, checked as boolean)
                        }
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`slot-${dayIndex}-${round.id}`}
                        className="cursor-pointer flex-1 text-sm"
                      >
                        <span className="font-medium text-gray-900">{round.name}</span>
                        <span className="text-gray-500 ml-2">
                          {round.startTime} - {round.endTime}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {hasChanges && (
            <span className="text-sm text-amber-600 self-center">
              You have unsaved changes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
