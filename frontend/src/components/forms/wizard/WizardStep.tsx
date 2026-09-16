// src/components/forms/wizard/WizardStep.tsx
import type { ReactNode } from "react"

interface WizardStepProps {
  titre: string
  children: ReactNode
}

export function WizardStep({ titre, children }: WizardStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-base font-semibold">{titre}</h3>
      {children}
    </div>
  )
}