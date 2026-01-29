"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, User, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

// Mock data
const mockBookings = [
  {
    id: 1,
    time: "08:00",
    name: "Somchai",
    type: "Health Checkup",
    status: "confirmed",
    color: "bg-teal-200 text-teal-800"
  },
  {
    id: 2,
    time: "09:30",
    name: "Anan",
    type: "Consultation",
    status: "pending",
    color: "bg-yellow-200 text-yellow-800"
  },
  {
    id: 3,
    time: "09:00",
    name: "Suchada",
    type: "Health Checkup",
    status: "confirmed",
    color: "bg-teal-200 text-teal-800"
  },
  {
    id: 4,
    time: "09:30",
    name: "Manat",
    type: "Vaccination",
    status: "pending",
    color: "bg-orange-200 text-orange-800"
  }
]

const mockSelectedBooking = {
  name: "Somchai",
  type: "Health Checkup",
  time: "9:00 AM - 9:30 AM",
  status: "confirmed"
}

const availableSlots = ["9:30", "9:30"]

export default function BookingCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState(mockSelectedBooking)

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
  const currentMonth = "July 2025"

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Calendar and Time Slots */}
      <div className="w-1/2 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking</h1>
        </div>

        {/* Date Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                July 23
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm">&lt;</Button>
              <h3 className="font-semibold">{currentMonth}</h3>
              <Button variant="ghost" size="sm">&gt;</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="p-2 font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Previous month days */}
              {[28, 23, 30, 31].map(day => (
                <div key={`prev-${day}`} className="p-2 text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Current month days */}
              {daysInMonth.slice(0, 27).map(day => (
                <div 
                  key={day} 
                  className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${
                    day === 23 ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {day}
                </div>
              ))}
              
              {/* Next month days */}
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={`next-${day}`} className="p-2 text-gray-400">
                  {day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {mockBookings.map((booking) => (
              <div 
                key={booking.id}
                className={`p-3 rounded-lg flex items-center justify-between ${booking.color}`}
              >
                <div>
                  <div className="font-medium">{booking.name}</div>
                  <div className="text-sm">{booking.type}</div>
                </div>
                <div className="text-sm font-medium">{booking.time}</div>
              </div>
            ))}
            
            {/* Available slots */}
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-2">Available</div>
              {availableSlots.map((slot, index) => (
                <div key={index} className="p-2 text-gray-500">
                  {slot}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter + Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-lg font-medium text-gray-700">
              Filter + Search
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Booking Details */}
      <div className="w-1/2 p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Name</div>
              <div className="font-medium">{selectedBooking.name}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Type</div>
              <div className="font-medium">{selectedBooking.type}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Time</div>
              <div className="font-medium">{selectedBooking.time}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600 capitalize">
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm">
                Move
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Booking Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Recent Booking
              </h3>
              <p className="text-gray-500">
                more in this
              </p>
              <p className="text-gray-500">
                telnumber
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
