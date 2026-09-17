// src/features/projets/activites/components/ActiviteListe.tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/shared/EmptyState"
import { ListChecks } from "lucide-react"
import { useActivites } from "@/features/projets/activites/api/useActivites"
import { useToggleActivite } from "@/features/projets/activites/api/useToggleActivite"

export function ActiviteListe({ projetId }: { projetId: string }) {
  const { data: activites, isLoading } = useActivites(projetId)
  const bascule = useToggleActivite(projetId)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  if (!activites || activites.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        titre="Aucune activite"
        message="Ajoutez une premiere activite pour suivre l'avancement du projet."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {[...activites].sort((a, b) => a.ordre - b.ordre).map((activite) => (
        <div key={activite.id} className="flex items-center gap-2 rounded-md border border-border p-2.5">
          <Checkbox
            id={`activite-${activite.id}`}
            checked={activite.terminee}
            onCheckedChange={() => bascule.mutate(activite.id)}
          />
          <Label
            htmlFor={`activite-${activite.id}`}
            className={activite.terminee ? "font-normal text-muted-foreground line-through" : "font-normal"}
          >
            {activite.intitule}
          </Label>
          {activite.date_echeance && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {new Date(activite.date_echeance).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}