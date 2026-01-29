"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  LinkIcon,
  Copy,
  Check,
  Edit,
  Save,
  X,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getBookingLinkById, updateBookingLink, getBookingsForLink, getBookingCountByLinkId, type BookingLink, type Booking } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { formatDateForInput } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { debounce } from "lodash"

export default function LinkViewPage() {
  const params = useParams()
  const linkId = Number.parseInt(params.linkId as string)
  const [linkData, setLinkData] = useState<BookingLink | null>(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState<string | null>("")
  const [editedIsActive, setEditedIsActive] = useState(false)
  const [editedLinkType, setEditedLinkType] = useState<"reusable" | "oneTime">("reusable")
  const [editedApprovalMode, setEditedApprovalMode] = useState<"auto" | "manual">("auto")
  const [editedExpirationType, setEditedExpirationType] = useState<"unlimited" | "limited">("unlimited")
  const [editedStartDate, setEditedStartDate] = useState<string>("")
  const [editedEndDate, setEditedEndDate] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // State for Recent Bookings section
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [totalRecentBookings, setTotalRecentBookings] = useState(0)
  const [currentRecentBookingsPage, setCurrentRecentBookingsPage] = useState(1)
  const [recentBookingsPageSize, setRecentBookingsPageSize] = useState(5)
  const [recentBookingsStatusFilter, setRecentBookingsStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all")
  const [recentBookingsSearchQuery, setRecentBookingsSearchQuery] = useState("")
  const [recentBookingsLoading, setRecentBookingsLoading] = useState(false)

  const { t } = useLanguage()
  const { toast } = useToast()

  // Debounced search handler for recent bookings
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setRecentBookingsSearchQuery(query)
      setCurrentRecentBookingsPage(1) // Reset to first page on search
    }, 500),
    [],
  )

  useEffect(() => {
    const fetchLinkAndBookings = async () => {
      setLoading(true)
      const fetchedLink = await getBookingLinkById(linkId)
      setLinkData(fetchedLink)
      if (fetchedLink) {
        setEditedName(fetchedLink.name)
        setEditedDescription(fetchedLink.description)
        setEditedIsActive(fetchedLink.isActive)
        setEditedLinkType(fetchedLink.linkType)
        setEditedApprovalMode(fetchedLink.approvalMode)
        setEditedExpirationType(fetchedLink.expirationType)
        setEditedStartDate(formatDateForInput(fetchedLink.startDate))
        setEditedEndDate(formatDateForInput(fetchedLink.endDate))
        
        // Fetch total booking count for this link
        const totalBookingsForLink = await getBookingCountByLinkId(fetchedLink.id)
        setTotalRecentBookings(totalBookingsForLink)
      }
      setLoading(false)
    }
    fetchLinkAndBookings()
  }, [linkId])

  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (!linkData) return
      setRecentBookingsLoading(true)
      const { bookings, totalCount } = await getBookingsForLink(
        linkData.id,
        currentRecentBookingsPage,
        recentBookingsPageSize,
        recentBookingsStatusFilter,
        recentBookingsSearchQuery,
      )
      setRecentBookings(bookings)
      setTotalRecentBookings(totalCount)
      setRecentBookingsLoading(false)
    }

    if (linkData) {
      fetchRecentBookings()
    }
  }, [
    linkData,
    currentRecentBookingsPage,
    recentBookingsPageSize,
    recentBookingsStatusFilter,
    recentBookingsSearchQuery,
  ])

  const copyToClipboard = () => {
    if (linkData?.uuid) {
      // Changed from linkData.url to linkData.uuid
      const bookingUrl = `${window.location.origin}/register/${linkData.uuid}`
      navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: t.copied,
        description: t.linkCopiedToClipboard,
      })
    }
  }

  const handleSave = async () => {
    if (!linkData) return

    setIsSaving(true)
    const formData = new FormData()
    formData.append("name", editedName)
    formData.append("description", editedDescription || "")
    formData.append("isActive", editedIsActive ? "on" : "off")
    formData.append("linkType", editedLinkType)
    formData.append("approvalMode", editedApprovalMode)
    formData.append("expirationType", editedExpirationType)
    if (editedExpirationType === "limited") {
      formData.append("startDate", editedStartDate)
      formData.append("endDate", editedEndDate)
    }

    const result = await updateBookingLink(linkData.id, formData)
    setIsSaving(false)

    if (result.success) {
      toast({
        title: t.success,
        description: result.message,
      })
      // Re-fetch data to ensure UI is up-to-date with saved changes
      const updatedLink = await getBookingLinkById(linkData.id)
      setLinkData(updatedLink)
      setIsEditing(false)
    } else {
      toast({
        title: t.error,
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (linkData) {
      setEditedName(linkData.name)
      setEditedDescription(linkData.description)
      setEditedIsActive(linkData.isActive)
      setEditedLinkType(linkData.linkType)
      setEditedApprovalMode(linkData.approvalMode)
      setEditedExpirationType(linkData.expirationType)
      setEditedStartDate(formatDateForInput(linkData.startDate))
      setEditedEndDate(formatDateForInput(linkData.endDate))
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t.loading}</p>
      </div>
    )
  }

  if (!linkData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/links">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back + " " + t.bookingLinks}
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.linkNotFound}</h2>
            <p className="text-gray-600">{t.linkNotFoundDesc}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for stats, as these would typically come from other tables
  const bookingsCount = totalRecentBookings // Use actual total bookings
  const clickCount = linkData.countClick // Use actual click count from database
  const conversionRate = clickCount > 0 ? Math.round((bookingsCount / clickCount) * 100) : 0 // Calculate conversion rate

  const totalPages = Math.ceil(totalRecentBookings / recentBookingsPageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/links">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back + " " + t.bookingLinks}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.linkDetails}</h1>
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
              {t.editLink}
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
                <p className="text-3xl font-bold text-gray-900">{bookingsCount}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.linkClicks}</p>
                <p className="text-3xl font-bold text-gray-900">{clickCount}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.conversionRate}</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.status}</p>
                <div className="flex flex-col gap-1">
                  <Badge className={linkData.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {linkData.isActive ? t.active : t.inactive}
                  </Badge>
                  {linkData.linkType === "oneTime" && (
                    <Badge 
                      className={
                        bookingsCount > 0 
                          ? "bg-red-100 text-red-700" 
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {bookingsCount > 0 ? "Used" : "One-time"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Link Information */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                {t.linkInformation}
              </CardTitle>
              <CardDescription>{isEditing ? t.editLinkDetails : t.viewManageLink}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Link Name */}
              <div className="space-y-2">
                <Label htmlFor="linkName">{t.linkName}</Label>
                {isEditing ? (
                  <Input
                    id="linkName"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-11"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{linkData.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedDescription || ""}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{linkData.description || t.noDescription}</p>
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label>{t.bookingURL}</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm flex-1">{`${window.location.origin}/register/${linkData.uuid}`}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className={copied ? "text-green-600 border-green-200" : "text-blue-600 border-blue-200"}
                  >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? t.copied : t.copy}
                  </Button>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="isActive" className="text-base font-medium">
                    {t.activeStatus}
                  </Label>
                  <p className="text-sm text-gray-600">{t.activeStatusDesc}</p>
                </div>
                {isEditing ? (
                  <Switch id="isActive" checked={editedIsActive} onCheckedChange={setEditedIsActive} />
                ) : (
                  <Badge className={linkData.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {linkData.isActive ? t.active : t.inactive}
                  </Badge>
                )}
              </div>

              {/* Created Date */}
              <div className="space-y-2">
                <Label>{t.createdDate}</Label>
                <p className="text-gray-600">{linkData.createdAt.toLocaleDateString()}</p>
              </div>

              {/* Advanced Configuration */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.advancedSettings}
                </h3>

                {/* Link Type */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{t.linkType}</Label>
                  {isEditing ? (
                    <Select
                      value={editedLinkType}
                      onValueChange={(value: "reusable" | "oneTime") => setEditedLinkType(value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reusable">{t.reusable}</SelectItem>
                        <SelectItem value="oneTime">{t.oneTimeUse}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-600">{linkData.linkType === "oneTime" ? t.oneTimeUse : t.reusable}</p>
                  )}
                </div>

                {/* Approval Mode */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{t.approvalMode}</Label>
                  {isEditing ? (
                    <Select
                      value={editedApprovalMode}
                      onValueChange={(value: "auto" | "manual") => setEditedApprovalMode(value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{t.autoApproval}</SelectItem>
                        <SelectItem value="manual">{t.manualApproval}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-600">
                      {linkData.approvalMode === "auto" ? t.autoApproval : t.manualApproval}
                    </p>
                  )}
                </div>

                {/* Link Expiration */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t.linkExpiration}</Label>
                  {isEditing ? (
                    <>
                      <RadioGroup
                        value={editedExpirationType}
                        onValueChange={(value: "unlimited" | "limited") => setEditedExpirationType(value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unlimited" id="unlimited" />
                          <Label htmlFor="unlimited">{t.unlimitedDuration}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="limited" id="limited" />
                          <Label htmlFor="limited">{t.setStartEndDate}</Label>
                        </div>
                      </RadioGroup>

                      {editedExpirationType === "limited" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">{t.startDate}</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={editedStartDate}
                              onChange={(e) => setEditedStartDate(e.target.value)}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">{t.endDate}</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={editedEndDate}
                              onChange={(e) => setEditedEndDate(e.target.value)}
                              min={editedStartDate}
                              className="h-11"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        {linkData.expirationType === "unlimited" ? t.unlimitedDuration : t.setStartEndDate}
                      </p>
                      {linkData.expirationType === "limited" && linkData.startDate && linkData.endDate && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {t.startDate}: {linkData.startDate.toLocaleDateString()} | {t.endDate}:{" "}
                            {linkData.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{t.recentBookings}</CardTitle>
            <CardDescription>{t.latestBookings}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder={t.searchBookings}
                  className="pl-9"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              <Select
                value={recentBookingsStatusFilter}
                onValueChange={(value) => {
                  setRecentBookingsStatusFilter(value as "all" | "pending" | "confirmed" | "cancelled")
                  setCurrentRecentBookingsPage(1) // Reset to first page on filter change
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                  <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recentBookingsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t.loadingBookings}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  // Helper function to extract display name from custom field data
                  const getDisplayName = (booking: any) => {
                    if (booking.customFieldData && Object.keys(booking.customFieldData).length > 0) {
                      // Try to find first text-like field with a value
                      const firstValue = Object.values(booking.customFieldData).find((field: any) => 
                        field && typeof field === 'object' && field.value && 
                        typeof field.value === 'string' && field.value.trim().length > 0
                      ) as any;
                      if (firstValue) {
                        return firstValue.value;
                      }
                    }
                    return `Booking ${booking.bookingNumber}`;
                  }

                  return (
                    <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{getDisplayName(booking)}</p>
                        <Badge
                          variant={booking.status === "confirmed" ? "default" : "secondary"}
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
                        <p>{booking.companyName || booking.customCompanyName || t.noCompany}</p>
                        <p>
                          {booking.roomName} • {booking.selectedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {recentBookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t.noBookingsYet}</p>
                  </div>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setCurrentRecentBookingsPage((prev) => Math.max(1, prev - 1))}
                      aria-disabled={currentRecentBookingsPage === 1}
                      tabIndex={currentRecentBookingsPage === 1 ? -1 : undefined}
                      className={currentRecentBookingsPage === 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        isActive={currentRecentBookingsPage === index + 1}
                        onClick={() => setCurrentRecentBookingsPage(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setCurrentRecentBookingsPage((prev) => Math.min(totalPages, prev + 1))}
                      aria-disabled={currentRecentBookingsPage === totalPages}
                      tabIndex={currentRecentBookingsPage === totalPages ? -1 : undefined}
                      className={
                        currentRecentBookingsPage === totalPages ? "pointer-events-none opacity-50" : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
