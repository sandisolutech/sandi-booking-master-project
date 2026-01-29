"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { createCompany } from "@/app/admin/companies/actions"

interface AddCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCompanyDialog({ open, onOpenChange }: AddCompanyDialogProps) {
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("active")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newCompany = await createCompany({
        name: companyName,
        email: email,
        phone: phone || null, // Pass null for empty strings to match DB schema
        website: website || null,
        address: address || null,
        description: description || null,
        // status is not directly in CompanySettings, but can be added if needed in DB
        // For now, it's handled by the default in the action or can be added to the DB schema
        // primaryColor and secondaryColor will use defaults from defaultCompanySettings if not provided
      })
      console.log("Company created:", newCompany)
      onOpenChange(false)
      // Reset form
      setCompanyName("")
      setEmail("")
      setPhone("")
      setWebsite("")
      setAddress("")
      setDescription("")
      setStatus("active") // Keep status for UI, but it's not sent to DB via this action
      // Optionally trigger a re-fetch in the parent component (CompaniesPage)
      // For example, by calling a prop function like `onCompanyAdded()`
    } catch (error) {
      console.error("Failed to create company:", error)
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-[1004]" data-tutorial="company-form">
        <DialogHeader>
          <DialogTitle>{t.addCompany}</DialogTitle>
          <DialogDescription>{t.companyInformation}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">{t.companyName} *</Label>
            <Input
              id="companyName"
              placeholder="e.g., TechCorp Solutions"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email} *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+66 (0) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">{t.website}</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">{t.address}</Label>
            <Textarea
              id="address"
              placeholder="123 ถนนธุรกิจ เมือง จังหวัด 12345"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief overview of the company's activities and mission."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t.status}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!companyName.trim() || !email.trim() || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? t.creating : t.createCompany}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
