"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface BookingActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any
  action: "approve" | "cancel" | "reject"
  onConfirm: (bookingId: string, action: string, reason?: string) => void
}

export function BookingActionDialog({ open, onOpenChange, booking, action, onConfirm }: BookingActionDialogProps) {
  const { t } = useLanguage()
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!booking) return

    setIsLoading(true)
    try {
      await onConfirm(booking.id, action, reason || undefined)
      onOpenChange(false)
      setReason("")
    } catch (error) {
      console.error("Error processing booking action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("")
    }
    onOpenChange(open)
  }

  const getActionConfig = () => {
    switch (action) {
      case "approve":
        return {
          title: t.confirmApproval,
          message: t.approvalConfirmMessage,
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          buttonClass: "bg-green-600 hover:bg-green-700",
          buttonText: t.approveBooking,
          showReason: false,
        }
      case "cancel":
        return {
          title: t.confirmCancellation,
          message: t.cancellationConfirmMessage,
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          buttonClass: "bg-red-600 hover:bg-red-700",
          buttonText: t.cancelBooking,
          showReason: true,
          reasonLabel: t.cancellationReason,
        }
      case "reject":
        return {
          title: t.confirmRejection,
          message: t.rejectionConfirmMessage,
          icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
          buttonClass: "bg-orange-600 hover:bg-orange-700",
          buttonText: t.rejectBooking,
          showReason: true,
          reasonLabel: t.rejectionReason,
        }
      default:
        return {
          title: "",
          message: "",
          icon: null,
          buttonClass: "",
          buttonText: "",
          showReason: false,
        }
    }
  }

  const config = getActionConfig()

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">{config.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm sm:text-base">{t.bookingDetails}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
              <div>
                <span className="font-medium">{t.influencer}:</span> {booking.influencer}
              </div>
              <div>
                <span className="font-medium">{t.companies}:</span> {booking.company}
              </div>
              <div>
                <span className="font-medium">{t.room}:</span> {booking.room}
              </div>
              <div>
                <span className="font-medium">{t.date}:</span> {booking.date}
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium">{t.timeSlot}:</span> {booking.round}
              </div>
            </div>
          </div>

          {/* Reason Input */}
          {config.showReason && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm sm:text-base">
                {config.reasonLabel} <span className="text-gray-500">({t.optional})</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={`${t.reason}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] text-sm sm:text-base"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto order-1 sm:order-2 text-white ${config.buttonClass}`}
          >
            {isLoading ? t.loading : config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
