"use client"

import { Button } from "@/components/ui/button"
import { useTutorial } from "@/lib/tutorial-context"
import { GraduationCap, RotateCcw } from "lucide-react"

export function TutorialButton() {
  const { isTutorialMode, isCompleted, startTutorial, restartTutorial } = useTutorial()

  if (isTutorialMode) return null

  return (
    <Button
      onClick={isCompleted ? restartTutorial : startTutorial}
      variant="outline"
      size="sm"
      className="text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      {isCompleted ? (
        <>
          <RotateCcw className="w-4 h-4 mr-2" />
          Review Tutorial
        </>
      ) : (
        <>
          <GraduationCap className="w-4 h-4 mr-2" />
          Start Tutorial
        </>
      )}
    </Button>
  )
}
