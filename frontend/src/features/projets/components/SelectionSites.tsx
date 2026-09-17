// src/features/projets/components/SelectionSites.tsx
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Site } from "@/types/api"

interface SelectionSitesProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionSites({ valeur, onChange }: SelectionSitesProps) {
  const { data: sites, isLoading } = useQuery({
    queryKey: ["referentiels", "sites"],
    queryFn: async () => {
      const reponse = await apiClient.get<Site[]>("/referentiels/sites")
      return reponse.data
    },
  })

  const basculer = (id: string) => {
    onChange(valeur.includes(id) ? valeur.filter((v) => v !== id) : [...valeur, id])
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      {sites?.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <Checkbox id={`site-${s.id}`} checked={valeur.includes(s.id)} onCheckedChange={() => basculer(s.id)} />
          <Label htmlFor={`site-${s.id}`} className="font-normal">{s.nom}</Label>
        </div>
      ))}
    </div>
  )
}