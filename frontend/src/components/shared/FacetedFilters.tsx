// src/components/shared/FacetedFilters.tsx
import type { ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export interface FacetteOptions {
  id: string
  libelle: string
  options: { valeur: string; label: string }[]
}

interface FacetedFiltersProps {
  facettes: FacetteOptions[]
  selection: Record<string, string[]>
  onChangement: (selection: Record<string, string[]>) => void
  children?: ReactNode
}

// Filtrage a facettes (section 8) : plusieurs cases a cocher combinables
// au sein d'un meme groupe et entre groupes.
export function FacetedFilters({ facettes, selection, onChangement, children }: FacetedFiltersProps) {
  const basculer = (groupe: string, valeur: string) => {
    const actuelles = selection[groupe] ?? []
    const nouvelles = actuelles.includes(valeur)
      ? actuelles.filter((v) => v !== valeur)
      : [...actuelles, valeur]
    onChangement({ ...selection, [groupe]: nouvelles })
  }

  const auMoinsUnFiltre = Object.values(selection).some((valeurs) => valeurs.length > 0)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      {facettes.map((facette) => (
        <div key={facette.id} className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {facette.libelle}
          </span>
          {facette.options.map((option) => (
            <div key={option.valeur} className="flex items-center gap-2">
              <Checkbox
                id={`${facette.id}-${option.valeur}`}
                checked={(selection[facette.id] ?? []).includes(option.valeur)}
                onCheckedChange={() => basculer(facette.id, option.valeur)}
              />
              <Label htmlFor={`${facette.id}-${option.valeur}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      ))}
      {children}
      {auMoinsUnFiltre && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start px-2 text-muted-foreground"
          onClick={() => onChangement({})}
        >
          <RotateCcw />
          Reinitialiser
        </Button>
      )}
    </div>
  )
}
