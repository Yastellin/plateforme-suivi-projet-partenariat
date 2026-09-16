// src/features/partenariats/components/SelectionPartenaires.tsx
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { usePartenaires } from "@/features/partenaires/api/usePartenaires"
import { useDebounce } from "@/hooks/useDebounce"

interface SelectionPartenairesProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionPartenaires({ valeur, onChange }: SelectionPartenairesProps) {
  const [recherche, setRecherche] = useState("")
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = usePartenaires({ nom: rechercheDebouncee || undefined, limit: 20 })

  const basculer = (id: string) => {
    if (valeur.includes(id)) {
      onChange(valeur.filter((v) => v !== id))
    } else {
      onChange([...valeur, id])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un partenaire..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Recherche...</p>
        ) : data?.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun partenaire trouve.</p>
        ) : (
          data?.data.map((partenaire) => (
            <div key={partenaire.id} className="flex items-center gap-2">
              <Checkbox
                id={`part-${partenaire.id}`}
                checked={valeur.includes(partenaire.id)}
                onCheckedChange={() => basculer(partenaire.id)}
              />
              <Label htmlFor={`part-${partenaire.id}`} className="font-normal">
                {partenaire.nom} — {partenaire.pays}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}