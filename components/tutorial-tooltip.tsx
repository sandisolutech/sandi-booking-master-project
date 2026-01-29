"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTutorial } from "@/lib/tutorial-context"
import { useLanguage } from "@/lib/language-context"

interface TutorialTooltipProps {
  stepId: number
  title: string
  titleTh: string
  description: string
  descriptionTh: string
  targetSelector?: string
  position?: "top" | "bottom" | "left" | "right"
  children?: React.ReactNode
}

export function TutorialTooltip({
  stepId,
  title,
  titleTh,
  description,
  descriptionTh,
  targetSelector,
  position = "bottom",
  children,
}: TutorialTooltipProps) {
  const { currentStep, totalSteps, goToNextStep, goToPreviousStep, exitTutorial } = useTutorial()
  const { language, t } = useLanguage()
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  // Use Thai or English based on language setting
  const displayTitle = language === "th" ? titleTh : title
  const displayDescription = language === "th" ? descriptionTh : description

  useEffect(() => {
    if (currentStep !== stepId) return

    let element: HTMLElement | null = null

    if (targetSelector) {
      // Try to find the target element
      element = document.querySelector(targetSelector) as HTMLElement

      if (!element) {
        console.warn(`Tutorial: Target element not found for selector: ${targetSelector}`)
        // If target not found, position tooltip in center
        setTooltipPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 200,
        })
        return
      }
    }

    if (element) {
      setTargetElement(element)

      // Add highlight effect
      element.style.position = "relative"
      element.style.zIndex = "1001"
      element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5)"
      element.style.borderRadius = "8px"
      element.style.animation = "pulse 2s infinite"

      // Calculate tooltip position
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      let top = 0
      let left = 0

      switch (position) {
        case "top":
          top = rect.top + scrollTop - 280
          left = rect.left + scrollLeft + rect.width / 2 - 200
          break
        case "bottom":
          top = rect.bottom + scrollTop + 20
          left = rect.left + scrollLeft + rect.width / 2 - 200
          break
        case "left":
          top = rect.top + scrollTop + rect.height / 2 - 140
          left = rect.left + scrollLeft - 420
          break
        case "right":
          top = rect.top + scrollTop + rect.height / 2 - 140
          left = rect.right + scrollLeft + 20
          break
      }

      // Ensure tooltip stays within viewport
      const maxLeft = window.innerWidth - 400
      const maxTop = window.innerHeight - 300

      left = Math.max(20, Math.min(left, maxLeft))
      top = Math.max(20, Math.min(top, maxTop))

      setTooltipPosition({ top, left })

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      // Center tooltip if no target
      setTooltipPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 200,
      })
    }

    // Cleanup function
    return () => {
      if (element) {
        element.style.position = ""
        element.style.zIndex = ""
        element.style.boxShadow = ""
        element.style.borderRadius = ""
        element.style.animation = ""
      }
    }
  }, [currentStep, stepId, targetSelector, position])

  if (currentStep !== stepId) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[1000]" style={{ pointerEvents: "none" }} />

      {/* Tooltip */}
      <div
        className="fixed z-[1003] w-96"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          pointerEvents: "auto",
        }}
      >
        <Card className="shadow-2xl border-2 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-blue-600">{displayTitle}</CardTitle>
              <Button variant="ghost" size="sm" onClick={exitTutorial} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm text-gray-600">
              {language === "th" ? `ขั้นตอนที่ ${currentStep} จาก ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{displayDescription}</p>

            {children && <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">{children}</div>}

            {targetSelector && (
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                👆{" "}
                {language === "th"
                  ? "มองหาองค์ประกอบที่ไฮไลต์ด้านบนและทำตามคำแนะนำ"
                  : "Look for the highlighted element above and follow the instruction"}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {language === "th" ? "ก่อนหน้า" : "Previous"}
              </Button>

              <div className="text-xs text-gray-500">
                {currentStep}/{totalSteps}
              </div>

              <Button
                size="sm"
                onClick={goToNextStep}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === totalSteps
                  ? language === "th"
                    ? "เสร็จสิ้น"
                    : "Finish"
                  : language === "th"
                    ? "ถัดไป"
                    : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
