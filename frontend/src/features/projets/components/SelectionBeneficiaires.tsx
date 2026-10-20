// src/features/projets/components/SelectionBeneficiaires.tsx
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Beneficiaire } from "@/types/api"

interface SelectionBeneficiairesProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionBeneficiaires({ valeur, onChange }: SelectionBeneficiairesProps) {
  const { data: beneficiaires, isLoading } = useQuery({
    queryKey: ["referentiels", "beneficiaires"],
    queryFn: async () => {
      const reponse = await apiClient.get<Beneficiaire[]>("/referentiels/beneficiaires")
      return reponse.data
    },
  })

  const basculer = (id: string) => {
    onChange(valeur.includes(id) ? valeur.filter((v) => v !== id) : [...valeur, id])
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      {beneficiaires?.map((b) => (
        <div key={b.id} className="flex items-center gap-2">
          <Checkbox id={`beneficiaire-${b.id}`} checked={valeur.includes(b.id)} onCheckedChange={() => basculer(b.id)} />
          <Label htmlFor={`beneficiaire-${b.id}`} className="font-normal">{b.nom}</Label>
        </div>
      ))}
    </div>
  )
}