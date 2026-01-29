"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LinkIcon, Plus, Edit, Trash2, Copy, Search, Calendar, Users, BarChart3, Eye } from "lucide-react"
import { AddLinkDialog } from "@/components/add-link-dialog"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { getAllBookingLinks, deleteBookingLink, getTotalBookingsCount, getBookingCountsForAllLinks, type BookingLink } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function LinksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddLink, setShowAddLink] = useState(false)
  const [links, setLinks] = useState<BookingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBookings, setTotalBookings] = useState(0)
  const [bookingCounts, setBookingCounts] = useState<Record<number, number>>({})
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [fetchedLinks, totalBookingsCount, bookingCountsData] = await Promise.all([
          getAllBookingLinks(),
          getTotalBookingsCount(),
          getBookingCountsForAllLinks()
        ])
        
        setLinks(fetchedLinks)
        setTotalBookings(totalBookingsCount)
        setBookingCounts(bookingCountsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredLinks = links.filter(
    (link) =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Calculate stats using real data from the database
  const totalLinksCount = links.length
  const activeLinks = links.filter((link) => link.isActive).length
  const totalClicks = links.reduce((sum, link) => sum + (link.countClick || 0), 0) // Sum all click counts
  const overallConversionRate = totalClicks > 0 ? Math.round((totalBookings / totalClicks) * 100) : 0 // Calculate conversion rate

  const copyToClipboard = (uuid: string) => {
    const fullUrl = `${window.location.origin}/register/${uuid}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: t.copied,
      description: t.linkCopiedToClipboard,
    })
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(t.confirmDeleteLink)) {
      const result = await deleteBookingLink(id)
      if (result.success) {
        toast({
          title: t.success,
          description: result.message,
        })
        setLinks(links.filter((link) => link.id !== id)) // Optimistic update
      } else {
        toast({
          title: t.error,
          description: result.message,
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.bookingLinks}</h1>
          <p className="text-gray-600 mt-1">{t.manageBookingLinks}</p>
        </div>
        <Button
          data-tutorial="create-link-btn"
          onClick={() => setShowAddLink(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.createNewLink}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalLinks}</p>
                <p className="text-3xl font-bold text-gray-900">{totalLinksCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.activeLinks}</p>
                <p className="text-3xl font-bold text-gray-900">{activeLinks}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalBookings}</p>
                <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalClicks}</p>
                <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
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
            placeholder={t.searchLinks}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tutorial="link-preview">
        {filteredLinks.length === 0 && !loading ? (
          <p className="text-gray-500 col-span-full text-center">{t.noLinksFound}</p>
        ) : (
          filteredLinks.map((link) => (
            <Card key={link.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{link.name}</CardTitle>
                      <Badge
                        variant={link.isActive ? "default" : "secondary"}
                        className={`text-xs mt-1 ${
                          link.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {link.isActive ? t.active : t.inactive}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm mt-2">{link.description || t.noDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* URL */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm flex-1 truncate">{`${window.location.origin}/register/${link.uuid}`}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.uuid)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{t.bookings}</p>
                      <p className="font-semibold text-gray-900">{bookingCounts[link.id] || 0}</p> {/* Show actual booking count */}
                    </div>
                    <div>
                      <p className="text-gray-600">{t.clicks}</p>
                      <p className="font-semibold text-gray-900">{link.countClick || 0}</p> {/* Show actual click count */}
                    </div>
                    <div>
                      <p className="text-gray-600">{t.conversion}</p>
                      <p className="font-semibold text-gray-900">
                        {link.countClick && link.countClick > 0 
                          ? Math.round(((bookingCounts[link.id] || 0) / link.countClick) * 100)
                          : 0}%
                      </p> {/* Calculate real conversion rate */}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-sm">
                    <p className="text-gray-600">{t.created}</p>
                    <p className="text-gray-900">{link.createdAt.toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/links/${link.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {t.view}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                      onClick={() => router.push(`/admin/links/${link.id}`)} // Navigate to edit page
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t.edit}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Link Dialog */}
      <AddLinkDialog open={showAddLink} onOpenChange={setShowAddLink} data-tutorial="link-config" />
    </div>
  )
}
