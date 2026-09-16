// src/features/projets/components/SelectionBailleurs.tsx
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Bailleur } from "@/types/api"

interface SelectionBailleursProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionBailleurs({ valeur, onChange }: SelectionBailleursProps) {
  const { data: bailleurs, isLoading } = useQuery({
    queryKey: ["referentiels", "bailleurs"],
    queryFn: async () => {
      const reponse = await apiClient.get<Bailleur[]>("/referentiels/bailleurs")
      return reponse.data
    },
  })

  const basculer = (id: string) => {
    onChange(valeur.includes(id) ? valeur.filter((v) => v !== id) : [...valeur, id])
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      {bailleurs?.map((b) => (
        <div key={b.id} className="flex items-center gap-2">
          <Checkbox id={`bailleur-${b.id}`} checked={valeur.includes(b.id)} onCheckedChange={() => basculer(b.id)} />
          <Label htmlFor={`bailleur-${b.id}`} className="font-normal">{b.nom}</Label>
        </div>
      ))}
    </div>
  )
}