"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRoomDayOff, type DayOffRecurrenceType } from "@/app/admin/rooms/actions"

interface DayOffModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
  onSuccess: () => void
}

const daysOfWeek = [
  { value: 0, label: "อาทิตย์" },
  { value: 1, label: "จันทร์" },
  { value: 2, label: "อังคาร" },
  { value: 3, label: "พุธ" },
  { value: 4, label: "พฤหัสบดี" },
  { value: 5, label: "ศุกร์" },
  { value: 6, label: "เสาร์" },
]

export function DayOffModal({ isOpen, onClose, roomId, onSuccess }: DayOffModalProps) {
  const [dayOffDate, setDayOffDate] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState<string>("")
  const [recurrenceType, setRecurrenceType] = useState<DayOffRecurrenceType>("once")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!dayOffDate && !dayOfWeek) {
      alert("กรุณาเลือกวันหยุด")
      return
    }

    setIsLoading(true)
    try {
      await addRoomDayOff(roomId, {
        dayOffDate: dayOffDate || undefined,
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : undefined,
        recurrenceType,
        reason: reason || undefined,
      })
      onSuccess()
      handleReset()
      onClose()
    } catch (error) {
      console.error("Error adding day off:", error)
      alert("เกิดข้อผิดพลาด")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setDayOffDate("")
    setDayOfWeek("")
    setRecurrenceType("once")
    setReason("")
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เพิ่มวันหยุด</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recurrence">ประเภท</Label>
            <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as DayOffRecurrenceType)}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">วันเดียว</SelectItem>
                <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                <SelectItem value="monthly">ทุกเดือน</SelectItem>
                <SelectItem value="yearly">ทุกปี</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrenceType === "once" && (
            <div className="space-y-2">
              <Label htmlFor="date">วันที่</Label>
              <Input
                id="date"
                type="date"
                value={dayOffDate}
                onChange={(e) => setDayOffDate(e.target.value)}
              />
            </div>
          )}

          {recurrenceType !== "once" && (
            <div className="space-y-2">
              <Label htmlFor="day-of-week">วันในสัปดาห์</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day-of-week">
                  <SelectValue placeholder="เลือกวัน" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผล (ไม่บังคับ)</Label>
            <Input
              id="reason"
              placeholder="เช่น ปิดซ่อม, วันสัญญาณ, เป็นต้น"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
