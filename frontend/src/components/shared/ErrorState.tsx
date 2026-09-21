// src/components/shared/ErrorState.tsx
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  titre?: string
  message?: string
  onReessayer?: () => void
  className?: string
}

export function ErrorState({
  titre = "Une erreur est survenue",
  message = "Le chargement des données a échoué. Veuillez réessayer.",
  onReessayer,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-statut-expire-bg">
        <AlertTriangle size={32} className="text-statut-expire-fg" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{titre}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{message}</p>
      {onReessayer && (
        <Button variant="outline" onClick={onReessayer} className="mt-4">
          Reessayer
        </Button>
      )}
    </div>
  )
}
