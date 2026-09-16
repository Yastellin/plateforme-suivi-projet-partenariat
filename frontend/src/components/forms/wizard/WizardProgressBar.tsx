// src/components/forms/wizard/WizardProgressBar.tsx
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardProgressBarProps {
  etapes: string[]
  etapeActive: number
}

export function WizardProgressBar({ etapes, etapeActive }: WizardProgressBarProps) {
  return (
    <div className="mb-6 flex items-center">
      {etapes.map((etape, index) => {
        const estTerminee = index < etapeActive
        const estActive = index === etapeActive

        return (
          <div key={etape} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  estTerminee && "border-primary bg-primary text-primary-foreground",
                  estActive && "border-primary text-primary",
                  !estTerminee && !estActive && "border-border text-muted-foreground"
                )}
              >
                {estTerminee ? <Check size={16} /> : index + 1}
              </div>
              <span className={cn("text-xs", estActive ? "font-medium text-foreground" : "text-muted-foreground")}>
                {etape}
              </span>
            </div>
            {index < etapes.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", estTerminee ? "bg-primary" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}