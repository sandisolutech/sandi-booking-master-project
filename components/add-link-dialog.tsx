"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createBookingLink } from "@/app/admin/links/actions"
import { useToast } from "@/hooks/use-toast"

interface AddLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddLinkDialog({ open, onOpenChange }: AddLinkDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [linkType, setLinkType] = useState<"reusable" | "oneTime">("reusable")
  const [approvalMode, setApprovalMode] = useState<"auto" | "manual">("auto")
  const [expirationType, setExpirationType] = useState<"unlimited" | "limited">("unlimited")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const { t } = useLanguage()
  const { toast } = useToast()

  const resetForm = () => {
    setLinkType("reusable")
    setApprovalMode("auto")
    setExpirationType("unlimited")
    setStartDate("")
    setEndDate("")
    setIsSaving(false)
  }

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
      onOpenChange(false)
      resetForm()
    } else {
      toast({
        title: t.error,
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.createNewLink}</DialogTitle>
          <DialogDescription>{t.fillDetailsCreateLink}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
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

          {/* Advanced Settings */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Save className="w-5 h-5" />
              {t.advancedSettings}
            </h3>

            {/* Link Type */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{t.linkType}</Label>
              <Select value={linkType} onValueChange={(value) => setLinkType(value as "reusable" | "oneTime")}>
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
              <Select value={approvalMode} onValueChange={(value) => setApprovalMode(value as "auto" | "manual")}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t.selectApprovalMode} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t.autoApproval}</SelectItem>
                  <SelectItem value="manual">{t.manualApproval}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t.linkExpiration}</Label>
              <RadioGroup
                value={expirationType}
                onValueChange={(value) => setExpirationType(value as "unlimited" | "limited")}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              {t.cancel}
            </Button>
            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
