// src/components/shared/EmptyState.tsx
import type { ComponentType, ReactNode } from "react"
import type { LucideProps } from "lucide-react"

interface EmptyStateProps {
  icon: ComponentType<LucideProps>
  titre: string
  message: string
  action?: ReactNode
}

// Etat vide concu specifiquement (section 3) : pictogramme 48px, message
// contextuel et action pertinente - jamais un "Aucune donnee" brut.
export function EmptyState({ icon: Icone, titre, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icone size={48} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="font-heading text-base font-semibold">{titre}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
