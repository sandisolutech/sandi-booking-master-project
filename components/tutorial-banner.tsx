"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTutorial } from "@/lib/tutorial-context"
import { useLanguage } from "@/lib/language-context"
import { GraduationCap, X, RotateCcw, ChevronUp, ChevronDown, CheckCircle } from "lucide-react"

export function TutorialBanner() {
  const { t } = useLanguage()
  const {
    isTutorialMode,
    currentStep,
    totalSteps,
    exitTutorial,
    restartTutorial,
    markAsComplete,
    getProgressPercentage,
  } = useTutorial()

  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!isTutorialMode) return null

  const progress = getProgressPercentage()
  const isLastStep = currentStep === totalSteps

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
      <div className="container mx-auto px-4">
        {!isCollapsed && (
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Tutorial Mode Active</h3>
                  <p className="text-sm text-blue-100">
                    Step {currentStep} of {totalSteps} • {progress}% Complete
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLastStep && (
                  <Button onClick={markAsComplete} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                )}

                <Button
                  onClick={restartTutorial}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-white/30 hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>

                <Button
                  onClick={exitTutorial}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-white/30 hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>
            </div>

            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-2 right-4 p-1 hover:bg-white/10 rounded"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isCollapsed && (
          <div className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm">
                Tutorial: Step {currentStep}/{totalSteps}
              </span>
            </div>
            <Progress value={progress} className="w-32 h-1 bg-white/20" />
          </div>
        )}
      </div>
    </div>
  )
}
