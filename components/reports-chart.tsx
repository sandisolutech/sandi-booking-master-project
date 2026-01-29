"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function ReportsChart() {
  const { t } = useLanguage()

  // Mock data for the chart
  const chartData = [
    { day: "Mon", bookings: 12 },
    { day: "Tue", bookings: 8 },
    { day: "Wed", bookings: 15 },
    { day: "Thu", bookings: 10 },
    { day: "Fri", bookings: 18 },
    { day: "Sat", bookings: 6 },
    { day: "Sun", bookings: 4 },
  ]

  const maxBookings = Math.max(...chartData.map((d) => d.bookings))

  // Get translated day names
  const getDayName = (day: string) => {
    switch (day) {
      case "Mon":
        return t.monday
      case "Tue":
        return t.tuesday
      case "Wed":
        return t.wednesday
      case "Thu":
        return t.thursday
      case "Fri":
        return t.friday
      case "Sat":
        return t.saturday
      case "Sun":
        return t.sunday
      default:
        return day
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          {t.weeklyBookingTrends}
        </CardTitle>
        <CardDescription>{t.bookingsPerDay}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-8 text-sm font-medium text-gray-600">{getDayName(data.day)}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${(data.bookings / maxBookings) * 100}%` }}
                >
                  <span className="text-white text-xs font-medium">{data.bookings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
