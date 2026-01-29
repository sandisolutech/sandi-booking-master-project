"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building,
  Edit,
  Save,
  X,
  Calendar,
  Users,
  LinkIcon,
  BarChart3,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { getCompanyById, updateCompany, type Company } from "@/app/admin/companies/actions"

// Mock data for stats and related lists (these would typically come from other tables or aggregated data)
const mockStatsAndLists = {
  totalBookings: 45,
  activeLinks: 3,
  totalRevenue: 12500,
  avgBookingValue: 278,
  recentBookings: [
    {
      id: "1",
      influencer: "Sarah Johnson",
      date: "2024-01-20",
      room: "Studio A",
      time: "9:00-10:00",
      status: "confirmed",
    },
    {
      id: "2",
      influencer: "Mike Chen",
      date: "2024-01-21",
      room: "Studio B",
      time: "10:00-11:00",
      status: "confirmed",
    },
    {
      id: "3",
      influencer: "Emma Davis",
      date: "2024-01-22",
      room: "Studio A",
      time: "11:00-12:00",
      status: "pending",
    },
  ],
  bookingLinks: [
    {
      id: "abc123",
      name: "TechCorp Event - January",
      url: "https://bookspace.com/register/abc123",
      bookings: 12,
      status: "active",
    },
    {
      id: "def456",
      name: "Q1 Product Launch",
      url: "https://bookspace.com/register/def456",
      bookings: 8,
      status: "active",
    },
    {
      id: "ghi789",
      name: "Team Building Sessions",
      url: "https://bookspace.com/register/ghi789",
      bookings: 5,
      status: "inactive",
    },
  ],
}

export default function CompanyViewPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const { t } = useLanguage()

  const [companyData, setCompanyData] = useState<Company | null>(null) // State for company data from DB
  const [loading, setLoading] = useState(true) // State for loading
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [editedPhone, setEditedPhone] = useState("")
  const [editedWebsite, setEditedWebsite] = useState("")
  const [editedAddress, setEditedAddress] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedStatus, setEditedStatus] = useState("active") // Initialize with a default or fetched value
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true)
      try {
        const id = Number.parseInt(companyId)
        if (isNaN(id)) {
          setCompanyData(null) // Handle invalid ID
          return
        }
        const data = await getCompanyById(id)
        setCompanyData(data)
        if (data) {
          setEditedName(data.name)
          setEditedEmail(data.email || "")
          setEditedPhone(data.phone || "")
          setEditedWebsite(data.website || "")
          setEditedAddress(data.address || "")
          setEditedDescription(data.description || "")
          setEditedStatus(data.status || "active") // Use status field directly
        }
      } catch (error) {
        console.error(`Failed to fetch company ${companyId}:`, error)
        setCompanyData(null) // Indicate error
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [companyId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t.loading}</p> {/* You might want a spinner here */}
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToCompanies}
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.companyNotFound}</h2>
            <p className="text-gray-600">{t.companyNotFoundDescription}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("name", editedName)
      formData.append("description", editedDescription)
      formData.append("email", editedEmail)
      formData.append("phone", editedPhone)
      formData.append("website", editedWebsite)
      formData.append("address", editedAddress)
      formData.append("status", editedStatus)
      
      const result = await updateCompany(companyData.id, formData)
      if (result.success) {
        // Re-fetch the company data to get the updated information
        const updatedData = await getCompanyById(companyData.id)
        setCompanyData(updatedData)
        setIsEditing(false)
        // Optionally show success toast
      } else {
        console.error("Update failed:", result.message)
        // Optionally show error toast
      }
    } catch (error) {
      console.error("Failed to save company:", error)
      // Optionally show error toast
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (companyData) {
      setEditedName(companyData.name)
      setEditedEmail(companyData.email || "")
      setEditedPhone(companyData.phone || "")
      setEditedWebsite(companyData.website || "")
      setEditedAddress(companyData.address || "")
      setEditedDescription(companyData.description || "")
      setEditedStatus(companyData.status || "active")
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToCompanies}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.companyDetails}</h1>
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
              {t.editCompany}
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalBookings}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStatsAndLists.totalBookings}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.activeLinks}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStatsAndLists.activeLinks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalRevenue}</p>
                <p className="text-3xl font-bold text-gray-900">${mockStatsAndLists.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Booking Value</p>
                <p className="text-3xl font-bold text-gray-900">${mockStatsAndLists.avgBookingValue}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="bookings">{t.recentBookings}</TabsTrigger>
          <TabsTrigger value="links">{t.bookingLinks}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Information */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    {t.companyInformation}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? t.editCompanyDetailsBelow : t.viewAndManage}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t.companyName}</Label>
                    {isEditing ? (
                      <Input
                        id="companyName"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-11"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{companyData.name}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.emailAddress}</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="h-11"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{companyData.email || "N/A"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.phoneNumber}</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          className="h-11"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{companyData.phone || "N/A"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">{t.website}</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        type="url"
                        value={editedWebsite}
                        onChange={(e) => setEditedWebsite(e.target.value)}
                        className="h-11"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {companyData.website ? (
                          <a
                            href={companyData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {companyData.website}
                          </a>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">{t.address}</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <span className="text-gray-900">{companyData.address}</span>
                      </div>
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
                      <p className="text-gray-600">{companyData.description}</p>
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
                          <SelectItem value="inactive">{t.inactive}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={`${
                          companyData.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {companyData.status}
                      </Badge>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="space-y-2">
                    <Label>{t.createdDate}</Label>
                    <p className="text-gray-600">{new Date(companyData.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{t.quickStats}</CardTitle>
                <CardDescription>{t.companyPerformanceOverview}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.conversionRate}</span>
                    <span className="font-semibold text-gray-900">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.repeatBookings}</span>
                    <span className="font-semibold text-gray-900">24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.avgSessionDuration}</span>
                    <span className="font-semibold text-gray-900">45 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.customerSatisfaction}</span>
                    <span className="font-semibold text-gray-900">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t.recentBookings}</CardTitle>
              <CardDescription>{t.latestBookingsFromCompany}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStatsAndLists.recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{booking.influencer}</p>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={`text-xs ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {booking.date} • {booking.time}
                      </p>
                      <p>{booking.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t.bookingLinks}</CardTitle>
              <CardDescription>{t.manageBookingLinksForCompany}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStatsAndLists.bookingLinks.map((link) => (
                  <div key={link.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{link.name}</h4>
                      <Badge
                        className={`text-xs ${
                          link.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {link.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-mono">{link.url}</p>
                      <p>{link.bookings} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
