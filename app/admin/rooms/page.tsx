"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Plus, Edit, Trash2, Clock, Search, Users } from "lucide-react"
import { AddRoomDialog } from "@/components/add-room-dialog"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { getRooms, deleteRoom, type Room } from "@/app/admin/rooms/actions" // Import Server Actions
import { TimeRoundsList } from "@/components/time-rounds-list" // Import the new component
import { useToast } from "@/hooks/use-toast"

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([]) // State to hold fetched rooms
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      const fetchedRooms = await getRooms()
      setRooms(fetchedRooms)
      setLoading(false)
    }
    fetchRooms()
  }, [showAddRoom]) // Re-fetch when AddRoomDialog closes

  const handleDeleteRoom = async (id: number) => {
    if (window.confirm(t.confirmDeleteRoom)) {
      const result = await deleteRoom(id)
      if (result.success) {
        toast({
          title: "Success!",
          description: t.deleteSuccess,
        })
        setRooms(rooms.filter((room) => room.id !== id)) // Optimistically update UI
      } else {
        toast({
          title: "Error",
          description: result.message || t.errorOccurred,
          variant: "destructive",
        })
      }
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Mock data for stats that are not directly from the rooms table
  const totalRooms = rooms.length
  const activeRooms = rooms.filter((room) => room.status === "active").length
  const timeRoundsCount = 6 // Placeholder, this will be dynamic once fetched in TimeRoundsList
  const todaysBookings = 12 // Placeholder, assuming this comes from another module

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t.loadingRooms}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.rooms}</h1>
          <p className="text-gray-600 mt-1">{t.manageRooms}</p>
        </div>
        <div className="flex gap-3">
          {/* Removed "Add Time Round" button as it's now inside TimeRoundsList */}
          <Button
            data-tutorial="add-room-btn"
            onClick={() => setShowAddRoom(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addRoom}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalRooms}</p>
                <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.activeRooms}</p>
                <p className="text-3xl font-bold text-gray-900">{activeRooms}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.timeRounds}</p>
                <p className="text-3xl font-bold text-gray-900">{timeRoundsCount}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.todaysBookings}</p>
                <p className="text-3xl font-bold text-gray-900">{todaysBookings}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholderRoom}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <Badge
                  variant={room.status === "active" ? "default" : "secondary"}
                  className={`text-xs ${
                    room.status === "active"
                      ? "bg-green-100 text-green-700"
                      : room.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {t[room.status as keyof typeof t]}
                </Badge>
              </div>
              <CardDescription className="text-sm">{room.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Room Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t.capacity}</p>
                    <p className="font-semibold text-gray-900">
                      {room.capacity} {t.people}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t.todaysBookings}</p>
                    <p className="font-semibold text-gray-900">0</p> {/* Placeholder for actual bookings */}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <p className="text-gray-600 text-sm mb-2">{t.equipment}</p>
                  <div className="flex flex-wrap gap-1">
                    {(room.equipment ?? []).map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/rooms/${room.id}`}>
                    <Button
                      data-tutorial="edit-room-btn"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t.edit}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredRooms.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t.noRoomsFound}</p>
          </div>
        )}
      </div>

      {/* Time Rounds Management Section */}
      <div className="mt-8">
        <TimeRoundsList />
      </div>

      {/* Add Room Dialog */}
      <AddRoomDialog open={showAddRoom} onOpenChange={setShowAddRoom} data-tutorial="room-form" />
    </div>
  )
}
