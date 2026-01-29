"use client"

import { useTutorial } from "@/lib/tutorial-context"
import { TutorialTooltip } from "@/components/tutorial-tooltip"
import { TutorialBanner } from "@/components/tutorial-banner"

export function TutorialOverlay() {
  const { isTutorialMode, currentTutorialStep } = useTutorial()

  if (!isTutorialMode || !currentTutorialStep) return null

  return (
    <>
      <TutorialBanner />
      <TutorialTooltip
        stepId={currentTutorialStep.id}
        title={currentTutorialStep.title}
        description={currentTutorialStep.description}
        targetSelector={currentTutorialStep.targetSelector}
        position={currentTutorialStep.position}
      />
    </>
  )
}
