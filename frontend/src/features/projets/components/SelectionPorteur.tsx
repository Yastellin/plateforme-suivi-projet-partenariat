// src/features/projets/components/SelectionPorteur.tsx
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Porteur } from "@/types/api"

interface SelectionPorteurProps {
  valeur?: string
  onChange: (id: string) => void
}

export function SelectionPorteur({ valeur, onChange }: SelectionPorteurProps) {
  const { data: porteurs, isLoading } = useQuery({
    queryKey: ["referentiels", "porteurs"],
    queryFn: async () => {
      const reponse = await apiClient.get<Porteur[]>("/referentiels/porteurs")
      return reponse.data
    },
  })

  return (
    <Select value={valeur} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder="Selectionner un porteur" />
      </SelectTrigger>
      <SelectContent>
        {porteurs?.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.nom} {p.institution_rattachement && `(${p.institution_rattachement})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}