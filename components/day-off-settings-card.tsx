"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AlertCircle, X, Calendar, ChevronLeft, ChevronRight, Plus, Edit2 } from 'lucide-react'
import { getRoomDayOffs, removeRoomDayOff, getAllRooms, type Room } from '@/app/admin/rooms/actions'
import { useToast } from '@/components/ui/use-toast'
import { getDayOfWeekInThailand } from '@/lib/utils'
import { DayOffDialog } from '@/components/day-off-dialog'
import { toDayOffDTOs, isDayOff } from '@/lib/dayoff-adaptor'
import type { DayOffDTO } from '@/lib/dayoff-adaptor'

export interface DayOffSettingsCardProps {
  autoSelectFirstRoom?: boolean
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]
const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const THAI_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export function DayOffSettingsCard({ autoSelectFirstRoom = true }: DayOffSettingsCardProps) {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [dayOffs, setDayOffs] = useState<DayOffDTO[]>([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarView, setCalendarView] = useState<'list' | 'calendar'>('calendar')
  const [showDialog, setShowDialog] = useState(false)
  const [editingDayOff, setEditingDayOff] = useState<DayOffDTO | null>(null)
  const [selectedDateForNewDayOff, setSelectedDateForNewDayOff] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  // Load rooms on mount
  useEffect(() => {
    loadRooms()
  }, [])

  // Load day offs when room changes
  useEffect(() => {
    if (selectedRoomId) {
      loadDayOffs(selectedRoomId)
    }
  }, [selectedRoomId])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const roomsList = await getAllRooms()
      setRooms(roomsList)
      
      if (roomsList.length > 0 && autoSelectFirstRoom) {
        setSelectedRoomId(roomsList[0].id)
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDayOffs = async (roomId: number) => {
    try {
      const rawDayOffs = await getRoomDayOffs(roomId)
      const dayOffsDTO = toDayOffDTOs(rawDayOffs)
      setDayOffs(dayOffsDTO)
    } catch (error) {
      console.error('Error loading day offs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load day offs',
        variant: 'destructive',
      })
    }
  }

  const handleRoomChange = async (roomId: string) => {
    const id = parseInt(roomId)
    setSelectedRoomId(id)
  }

  const handleRemoveDayOff = async (dayOffId: number) => {
    if (!confirm('Are you sure you want to delete this day off?')) {
      return
    }

    try {
      await removeRoomDayOff(dayOffId)
      setDayOffs((prev) => prev.filter((d) => d.id !== dayOffId))
      toast({
        title: 'Success',
        description: 'Day off deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting day off:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete day off',
        variant: 'destructive',
      })
    }
  }

  const handleFormSuccess = async () => {
    setShowDialog(false)
    setEditingDayOff(null)
    if (selectedRoomId) {
      await loadDayOffs(selectedRoomId)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDayDate = new Date(date.getFullYear(), date.getMonth(), 1)
    return getDayOfWeekInThailand(firstDayDate) // Use Bangkok timezone for consistency
  }

  const previousMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1)
    )
  }

  const nextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1)
    )
  }

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth)
    const firstDay = getFirstDayOfMonth(calendarMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
      const dayOffForDate = isDayOff(date, dayOffs)
      const isToday =
        date.toDateString() === new Date().toDateString()

      const handleDayClick = () => {
        if (dayOffForDate) {
          // If day off exists, open edit dialog
          setEditingDayOff(dayOffForDate)
          setSelectedDateForNewDayOff(null)
        } else {
          // If regular day, open add dialog with pre-filled date
          setEditingDayOff(null)
          setSelectedDateForNewDayOff(date)
        }
        setShowDialog(true)
      }

      days.push(
        <div
          key={day}
          onClick={handleDayClick}
          className={`p-2 rounded text-center text-sm font-medium cursor-pointer transition-colors ${
            dayOffForDate
              ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
              : isToday
              ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          } hover:shadow-md`}
          title={dayOffForDate ? `Day Off: ${dayOffForDate.reason || 'No reason'} (Click to edit)` : 'Click to add day off'}
        >
          {day}
        </div>
      )
    }

    return days
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            วันหยุดห้อง (Room Day Off Settings)
          </CardTitle>
          <CardDescription>
            จัดการวันหยุดสำหรับแต่ละห้อง (Manage day off settings for each room)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Selector */}
          <div className="space-y-2">
            <Label htmlFor="room-select">เลือกห้อง (Select Room)</Label>
            <Select
              value={selectedRoomId?.toString() || ''}
              onValueChange={handleRoomChange}
            >
              <SelectTrigger id="room-select">
                <SelectValue placeholder="Choose a room..." />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoomId && (
            <div className="space-y-6">
              {/* View Toggle and Add Button */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  <Button
                    variant={calendarView === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('calendar')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                  </Button>
                  <Button
                    variant={calendarView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('list')}
                  >
                    List
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setEditingDayOff(null)
                    setSelectedDateForNewDayOff(null)
                    setShowDialog(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มวันหยุด
                </Button>
              </div>

              {/* Calendar View */}
              {calendarView === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Calendar */}
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={previousMonth}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <h3 className="text-lg font-semibold">
                            {THAI_MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear() + 543}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextMonth}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {THAI_DAYS_SHORT.map((day) => (
                            <div
                              key={day}
                              className="text-center text-sm font-semibold text-gray-600 p-2"
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                          {renderCalendar()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Calendar Legend and Info */}
                  <div className="space-y-4">
                    <Card className="border-0 shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Legend</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-100 border border-red-300 rounded" />
                          <span className="text-sm">Day Off</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-50 border border-blue-300 rounded" />
                          <span className="text-sm">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-50 border border-gray-300 rounded" />
                          <span className="text-sm">Regular Day</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Total Day Offs:</span>
                          <span className="font-semibold ml-2">{dayOffs.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Single Days:</span>
                          <span className="font-semibold ml-2">
                            {dayOffs.filter((d) => d.recurrenceType === 'once').length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Recurring:</span>
                          <span className="font-semibold ml-2">
                            {dayOffs.filter((d) => d.recurrenceType !== 'once').length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* List View */}
              {calendarView === 'list' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium">
                    {dayOffs.length} day off{dayOffs.length !== 1 ? 's' : ''} configured
                  </div>

                  {dayOffs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No day offs configured for this room</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayOffs.map((dayOff) => (
                        <div
                          key={dayOff.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {dayOff.displayDay}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {dayOff.reason || 'ไม่มีเหตุผล (No reason)'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                {dayOff.recurrenceLabel}
                              </span>
                              {dayOff.nextOccurrence && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Next: {dayOff.nextOccurrence.toLocaleDateString('th-TH')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDayOff(dayOff)
                                setShowDialog(true)
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDayOff(dayOff.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Off Dialog Modal */}
      <DayOffDialog
        isOpen={showDialog}
        roomId={selectedRoomId || 0}
        editingDayOff={editingDayOff}
        selectedDate={selectedDateForNewDayOff}
        onSuccess={handleFormSuccess}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            setSelectedDateForNewDayOff(null)
          }
        }}
      />
    </div>
  )
}
