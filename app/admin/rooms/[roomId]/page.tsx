"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Edit, Save, X, Plus, Calendar, Users, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { getRoomById, updateRoom, type Room } from "@/app/admin/rooms/actions" // Import Server Actions
import { getAllTimeRounds, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { RoomTimeSlotsAvailability } from "@/components/room-time-slots-availability"

export default function RoomViewPage() {
  const params = useParams()
  const roomId = Number.parseInt(params.roomId as string)
  const { t } = useLanguage()

  const [roomData, setRoomData] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedCapacity, setEditedCapacity] = useState("")
  const [editedStatus, setEditedStatus] = useState("active")
  const [editedEquipment, setEditedEquipment] = useState<string[]>([])
  const [newEquipment, setNewEquipment] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])

  // Mock data for related statistics and bookings (not stored in rooms table)
  const mockStats = {
    bookingsToday: 5,
    totalBookings: 45,
    utilizationRate: 78,
  }

  const mockRecentBookings = [
    {
      id: "1",
      influencer: "Sarah Johnson",
      company: "TechCorp",
      date: "2024-01-15",
      time: "9:00-10:00",
      status: "confirmed",
    },
    {
      id: "2",
      influencer: "Emma Davis",
      company: "BeautyLab",
      date: "2024-01-15",
      time: "11:00-12:00",
      status: "pending",
    },
    {
      id: "3",
      influencer: "David Kim",
      company: "TechCorp",
      date: "2024-01-17",
      time: "9:00-10:00",
      status: "cancelled",
    },
  ]

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true)
      const fetchedRoom = await getRoomById(roomId)
      setRoomData(fetchedRoom)
      if (fetchedRoom) {
        setEditedName(fetchedRoom.name)
        setEditedDescription(fetchedRoom.description || "")
        setEditedCapacity(fetchedRoom.capacity.toString())
        setEditedStatus(fetchedRoom.status)
        setEditedEquipment(fetchedRoom.equipment || [])
      }

      // Fetch time rounds
      const fetchedTimeRounds = await getAllTimeRounds()
      setTimeRounds(fetchedTimeRounds)

      setLoading(false)
    }
    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  const addEquipment = () => {
    if (newEquipment.trim() && !editedEquipment.includes(newEquipment.trim())) {
      setEditedEquipment([...editedEquipment, newEquipment.trim()])
      setNewEquipment("")
    }
  }

  const removeEquipment = (item: string) => {
    setEditedEquipment(editedEquipment.filter((eq) => eq !== item))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const formData = new FormData()
    formData.append("name", editedName)
    formData.append("description", editedDescription)
    formData.append("capacity", editedCapacity)
    formData.append("equipment", JSON.stringify(editedEquipment))
    formData.append("status", editedStatus)

    const result = await updateRoom(roomId, formData)

    if (result.success) {
      console.log(result.message)
      setIsEditing(false)
      // Refresh room data after update
      const updatedRoom = await getRoomById(roomId)
      setRoomData(updatedRoom)
    } else {
      console.error(result.message)
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    if (roomData) {
      setEditedName(roomData.name)
      setEditedDescription(roomData.description || "")
      setEditedCapacity(roomData.capacity.toString())
      setEditedStatus(roomData.status)
      setEditedEquipment(roomData.equipment || [])
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t.loadingRoomDetails}</p>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToRooms}
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.roomNotFound}</h2>
            <p className="text-gray-600">{t.roomNotFoundDescription}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToRooms}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.roomDetails}</h1>
            <p className="text-gray-600 mt-1">{t.viewAndManage}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                {t.cancel}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  t.saving
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t.save}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t.editRoom}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.todaysBookings}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.bookingsToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalBookings}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalBookings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.utilizationRate}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.utilizationRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.capacity}</p>
                <p className="text-3xl font-bold text-gray-900">{roomData.capacity}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Room Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {t.roomInformation}
              </CardTitle>
              <CardDescription>{isEditing ? t.editRoomDetailsBelow : t.viewAndManageYourRoom}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <Label htmlFor="roomName">{t.roomName}</Label>
                {isEditing ? (
                  <Input
                    id="roomName"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-11"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{roomData.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{roomData.description}</p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">{t.capacity}</Label>
                {isEditing ? (
                  <Input
                    id="capacity"
                    type="number"
                    value={editedCapacity}
                    onChange={(e) => setEditedCapacity(e.target.value)}
                    min="1"
                    className="h-11"
                  />
                ) : (
                  <p className="text-gray-900">
                    {roomData.capacity} {t.people}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                {isEditing ? (
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t.active}</SelectItem>
                      <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                      <SelectItem value="inactive">{t.inactive}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={`${
                      roomData.status === "active"
                        ? "bg-green-100 text-green-700"
                        : roomData.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t[roomData.status as keyof typeof t]}
                  </Badge>
                )}
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <Label>{t.equipment}</Label>
                {isEditing ? (
                  <div className="space-y-3">
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
                    {editedEquipment.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editedEquipment.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <button
                              type="button"
                              onClick={() => removeEquipment(item)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roomData.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Off Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              วันหยุด (Day Off Settings)
            </CardTitle>
            <CardDescription>
              Manage day offs in the Settings page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-4">
                Please use the Day Off Settings in the main Settings page to add, edit, or remove day offs for this room. This provides a better interface with calendar view and more features.
              </p>
              <Link href="/admin/settings?tab=day-offs">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Go to Day Off Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Room Time Slots Availability */}
        {timeRounds.length > 0 && (
          <RoomTimeSlotsAvailability
            roomId={roomId}
            timeRounds={timeRounds.map((round) => ({
              id: round.id,
              name: round.name,
              startTime: round.startTime,
              endTime: round.endTime,
              isActive: round.isActive,
            }))}
            onSuccess={() => {
              // Optional: refresh or show confirmation
              console.log('Time slot availability updated')
            }}
          />
        )}

      </div>
    </div>
  )
}
