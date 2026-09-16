// src/features/partenariats/components/SelectionEtablissements.tsx
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Etablissement {
  id: string
  nom: string
  sigle?: string
}

interface SelectionEtablissementsProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionEtablissements({ valeur, onChange }: SelectionEtablissementsProps) {
  const { data: etablissements, isLoading } = useQuery({
    queryKey: ["etablissements"],
    queryFn: async () => {
      const reponse = await apiClient.get<Etablissement[]>("/etablissements")
      return reponse.data
    },
  })

  const basculer = (id: string) => {
    if (valeur.includes(id)) {
      onChange(valeur.filter((v) => v !== id))
    } else {
      onChange([...valeur, id])
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des etablissements...</p>
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      {etablissements?.map((etab) => (
        <div key={etab.id} className="flex items-center gap-2">
          <Checkbox
            id={`etab-${etab.id}`}
            checked={valeur.includes(etab.id)}
            onCheckedChange={() => basculer(etab.id)}
          />
          <Label htmlFor={`etab-${etab.id}`} className="font-normal">
            {etab.nom} {etab.sigle && `(${etab.sigle})`}
          </Label>
        </div>
      ))}
    </div>
  )
}