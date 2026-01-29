"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building, Plus, Edit, Trash2, Search, Users, Globe, Mail, Phone } from "lucide-react"
import { AddCompanyDialog } from "@/components/add-company-dialog"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { getCompanies, deleteCompany, type Company } from "@/app/admin/companies/actions"

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([]) // New state for companies
  const [loading, setLoading] = useState(true) // New state for loading
  const { t } = useLanguage()

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      try {
        const data = await getCompanies()
        setCompanies(data)
      } catch (error) {
        console.error("Failed to fetch companies:", error)
        // Optionally show a toast or error message
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalCompanies = companies.length
  const activeCompanies = companies.filter((company) => company.status === "active").length
  const totalBookings = companies.reduce((sum, company) => sum + (company.totalBookings || 0), 0) // Add || 0 for safety
  const totalActiveLinks = companies.reduce((sum, company) => sum + (company.activeLinks || 0), 0) // Add || 0 for safety

  const handleDeleteCompany = async (id: number) => {
    if (window.confirm(t.companies.confirmDeleteCompany)) {
      try {
        await deleteCompany(id)
        setCompanies(companies.filter((company) => company.id !== id))
        // Optionally show success toast
      } catch (error) {
        console.error("Failed to delete company:", error)
        // Optionally show error toast
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t.loading}</p> {/* You might want a spinner here */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.companyManagement}</h1>
          <p className="text-gray-600 mt-1">{t.manageCompanies}</p>
        </div>
        <Button
          data-tutorial="add-company-btn"
          onClick={() => setShowAddCompany(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.addCompany}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.totalCompanies}</p>
                <p className="text-3xl font-bold text-gray-900">{totalCompanies}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.activeCompanies}</p>
                <p className="text-3xl font-bold text-gray-900">{activeCompanies}</p>
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
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t.activeLinks}</p>
                <p className="text-3xl font-bold text-gray-900">{totalActiveLinks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
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
            placeholder={t.searchCompanies}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{company.name.charAt(0)}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge
                      variant={company.status === "active" ? "default" : "secondary"}
                      className={`text-xs mt-1 ${
                        company.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {company.status === "active" ? t.active : t.inactive}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm mt-2">{company.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                        {company.website ? company.website.replace("https://", "") : ""}
                    </a>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t.totalBookings}</p>
                    <p className="font-semibold text-gray-900">{company.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t.activeLinks}</p>
                    <p className="font-semibold text-gray-900">{company.activeLinks}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="text-sm">
                  <p className="text-gray-600">{t.address}</p>
                  <p className="text-gray-900">{company.address}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/companies/${company.id}`}>
                    <Button
                      data-tutorial="edit-company-btn"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t.edit}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Company Dialog */}
      <AddCompanyDialog open={showAddCompany} onOpenChange={setShowAddCompany} data-tutorial="company-form" />
    </div>
  )
}
