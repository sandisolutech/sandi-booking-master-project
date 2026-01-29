"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Building2, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { RecentBookings } from "@/components/recent-bookings"

export default function DashboardPage() {
  const { t } = useLanguage()

  // Mock real data - in production this would come from your API
  const stats = {
    totalBookings: 156,
    pendingBookings: 23,
    confirmedBookings: 98,
    rejectedBookings: 12,
    totalCompanies: 45,
    totalRooms: 12,
    totalLinks: 8,
    monthlyRevenue: 125000,
  }

  const recentActivity = [
    { type: "booking", message: "New booking from TechCorp", time: "2 minutes ago" },
    { type: "company", message: "StartupXYZ updated their profile", time: "15 minutes ago" },
    { type: "room", message: "Conference Room A was booked", time: "1 hour ago" },
    { type: "link", message: "New booking link created", time: "2 hours ago" },
  ]

  return (
    <div className="space-y-6" data-tutorial="dashboard-overview">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard}</h1>
        <p className="text-muted-foreground">{t.dashboardDescription}</p>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tutorial="dashboard-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalBookings}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingApproval}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Requires your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalCompanies}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.monthlyRevenue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" data-tutorial="create-link-button">
              <Link href="/admin/links/create">
                <CalendarDays className="mr-2 h-4 w-4" />
                {t.createBookingLink}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" data-tutorial="add-company-btn">
              <Link href="/admin/companies">
                <Building2 className="mr-2 h-4 w-4" />
                {t.addCompany}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" data-tutorial="add-room-btn">
              <Link href="/admin/rooms">
                <Users className="mr-2 h-4 w-4" />
                {t.addRoom}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Booking Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.bookingStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t.confirmed}</span>
              </div>
              <span className="font-semibold">{stats.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">{t.pending}</span>
              </div>
              <span className="font-semibold">{stats.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">{t.rejected}</span>
              </div>
              <span className="font-semibold">{stats.rejectedBookings}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="flex-1">{activity.message}</span>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card data-tutorial="recent-bookings">
        <CardHeader>
          <CardTitle>{t.recentBookings}</CardTitle>
          <CardDescription>{t.recentBookingsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentBookings />
        </CardContent>
      </Card>
    </div>
  )
}
