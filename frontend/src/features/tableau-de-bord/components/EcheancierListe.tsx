// src/features/tableau-de-bord/components/EcheancierListe.tsx
import { CalendarClock } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { useEcheancier } from "@/features/tableau-de-bord/api/useEcheancier"

export function EcheancierListe() {
  const { data: echeances, isLoading } = useEcheancier()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  if (!echeances || echeances.length === 0) {
    return <EmptyState icon={CalendarClock} titre="Aucune echeance proche" message="Rien a surveiller pour l'instant." />
  }

  return (
    <div className="flex flex-col gap-2">
      {echeances.map((e) => (
        <div key={e.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
          <span className="text-sm">{e.titre}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(e.date_echeance).toLocaleDateString("fr-FR")}
          </span>
        </div>
      ))}
    </div>
  )
}