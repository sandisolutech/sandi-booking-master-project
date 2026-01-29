"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { createRoom } from "@/app/admin/rooms/actions" // Import the Server Action

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const { t } = useLanguage()
  const [roomName, setRoomName] = useState("")
  const [description, setDescription] = useState("")
  const [capacity, setCapacity] = useState("")
  const [equipment, setEquipment] = useState<string[]>([])
  const [newEquipment, setNewEquipment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()])
      setNewEquipment("")
    }
  }

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter((eq) => eq !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("name", roomName)
    formData.append("description", description)
    formData.append("capacity", capacity)
    formData.append("equipment", JSON.stringify(equipment)) // Stringify the array

    const result = await createRoom(formData)

    if (result.success) {
      console.log(result.message)
      onOpenChange(false)
      // Reset form
      setRoomName("")
      setDescription("")
      setCapacity("")
      setEquipment([])
      setNewEquipment("")
    } else {
      console.error(result.message)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.addNewRoom}</DialogTitle>
          <DialogDescription>{t.createNewRoomDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="roomName">
              {t.roomName} {t.required}
            </Label>
            <Input
              id="roomName"
              name="name" // Add name attribute for FormData
              placeholder="e.g., Studio A"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              name="description" // Add name attribute for FormData
              placeholder="อธิบายห้องและคุณสมบัติ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">
              {t.capacity} {t.required}
            </Label>
            <Input
              id="capacity"
              name="capacity" // Add name attribute for FormData
              type="number"
              placeholder={t.maxPeople}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label>{t.equipment}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t.addEquipmentItem}
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
              />
              <Button type="button" variant="outline" onClick={addEquipment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {equipment.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button type="button" onClick={() => removeEquipment(item)} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!roomName.trim() || !capacity || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? t.creating : t.createRoom}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
