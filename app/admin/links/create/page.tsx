"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createBookingLink } from "../actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreateLinkPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [linkType, setLinkType] = useState<"reusable" | "oneTime">("reusable")
  const [approvalMode, setApprovalMode] = useState<"auto" | "manual">("auto")
  const [expirationType, setExpirationType] = useState<"unlimited" | "limited">("unlimited")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    formData.append("linkType", linkType)
    formData.append("approvalMode", approvalMode)
    formData.append("expirationType", expirationType)
    if (expirationType === "limited") {
      formData.append("startDate", startDate)
      formData.append("endDate", endDate)
    } else {
      formData.delete("startDate")
      formData.delete("endDate")
    }

    const result = await createBookingLink(formData)
    setIsSaving(false)

    if (result.success) {
      toast({
        title: t.success,
        description: result.message,
      })
      router.push("/admin/links")
    } else {
      toast({
        title: t.error,
        description: result.message,
        variant: "destructive",
      })
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{t.createNewLink}</h1>
            <p className="text-gray-600 mt-1">{t.fillDetailsCreateLink}</p>
          </div>
        </div>
        <Button
          type="submit"
          form="create-link-form"
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSaving ? (
            t.creating
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t.createLink}
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>{t.linkInformation}</CardTitle>
          <CardDescription>{t.enterLinkDetails}</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="create-link-form" action={handleSubmit} className="space-y-6">
            {/* Link Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.linkName}</Label>
              <Input id="name" name="name" required className="h-11" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-base font-medium">
                  {t.activeStatus}
                </Label>
                <p className="text-sm text-gray-600">{t.activeStatusDesc}</p>
              </div>
              <Switch id="isActive" name="isActive" defaultChecked />
            </div>

            {/* Advanced Configuration */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Save className="w-5 h-5" />
                {t.advancedSettings}
              </h3>

              {/* Link Type */}
              <div className="space-y-2">
                <Label className="text-base font-medium">{t.linkType}</Label>
                <Select value={linkType} onValueChange={(value: "reusable" | "oneTime") => setLinkType(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.selectLinkType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reusable">{t.reusable}</SelectItem>
                    <SelectItem value="oneTime">{t.oneTimeUse}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Approval Mode */}
              <div className="space-y-2">
                <Label className="text-base font-medium">{t.approvalMode}</Label>
                <Select value={approvalMode} onValueChange={(value: "auto" | "manual") => setApprovalMode(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.selectApprovalMode} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t.autoApproval}</SelectItem>
                    <SelectItem value="manual">{t.manualApproval}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Link Expiration */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t.linkExpiration}</Label>
                <RadioGroup
                  value={expirationType}
                  onValueChange={(value: "unlimited" | "limited") => setExpirationType(value)}
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

                {expirationType === "limited" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">{t.startDate}</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">{t.endDate}</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="h-11"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
