"use client"

import { TutorialTooltip } from "@/components/tutorial-tooltip"
import { useTutorial } from "@/lib/tutorial-context"
import { useLanguage } from "@/lib/language-context"

export function TutorialSteps() {
  const { isTutorialMode, currentTutorialStep } = useTutorial()
  const { language } = useLanguage()

  if (!isTutorialMode || !currentTutorialStep) return null

  return (
    <TutorialTooltip
      stepId={currentTutorialStep.id}
      title={currentTutorialStep.title}
      titleTh={currentTutorialStep.titleTh}
      description={currentTutorialStep.description}
      descriptionTh={currentTutorialStep.descriptionTh}
      targetSelector={currentTutorialStep.targetSelector}
      position={currentTutorialStep.position}
    />
  )
}
