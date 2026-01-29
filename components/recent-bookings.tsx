"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, Building } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const recentBookings = [
  {
    id: "1",
    influencer: "Sarah Johnson",
    company: "TechCorp",
    room: "Studio A",
    date: "2024-01-15",
    time: "09:00 - 10:00",
    status: "confirmed",
  },
  {
    id: "2",
    influencer: "Mike Chen",
    company: "FashionBrand",
    room: "Studio B",
    date: "2024-01-15",
    time: "10:00 - 11:00",
    status: "confirmed",
  },
  {
    id: "3",
    influencer: "Emma Davis",
    company: "BeautyLab",
    room: "Studio A",
    date: "2024-01-15",
    time: "11:00 - 12:00",
    status: "pending",
  },
  {
    id: "4",
    influencer: "Alex Rivera",
    company: "FitnessPro",
    room: "Studio C",
    date: "2024-01-16",
    time: "14:00 - 15:00",
    status: "confirmed",
  },
  {
    id: "5",
    influencer: "Lisa Wang",
    company: "TravelCo",
    room: "Studio B",
    date: "2024-01-16",
    time: "15:00 - 16:00",
    status: "confirmed",
  },
]

export function RecentBookings() {
  const { t } = useLanguage()

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {t.recentBookings}
        </CardTitle>
        <CardDescription>Latest room reservations from influencers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {booking.influencer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{booking.influencer}</p>
                    <Badge
                      variant={booking.status === "confirmed" ? "default" : "secondary"}
                      className={`text-xs ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status === "confirmed" ? t.confirmed : t.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {booking.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.room}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                <p className="text-xs text-gray-500">{booking.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
