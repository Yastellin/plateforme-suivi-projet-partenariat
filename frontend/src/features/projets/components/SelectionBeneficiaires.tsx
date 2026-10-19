// src/features/projets/components/SelectionBeneficiaires.tsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCreateBeneficiaire } from "@/features/referentiels/api/useCreateBeneficiaire"
import type { Beneficiaire } from "@/types/api"

interface SelectionBeneficiairesProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionBeneficiaires({ valeur, onChange }: SelectionBeneficiairesProps) {
  const [recherche, setRecherche] = useState("")
  const creation = useCreateBeneficiaire()

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

  // Combobox : la recherche filtre la liste et permet de creer un beneficiaire
  // a la volee quand aucun resultat ne correspond au terme saisi.
  const terme = recherche.trim()
  const filtres = terme
    ? (beneficiaires ?? []).filter((b) =>
        b.nom.toLowerCase().includes(terme.toLowerCase()),
      )
    : beneficiaires ?? []
  const propositionCreation = terme.length >= 2 && filtres.length === 0 && !isLoading

  const creerBeneficiaire = () => {
    creation.mutate(
      { nom: terme },
      {
        onSuccess: (cree) => {
          // L'element cree est automatiquement coche dans le formulaire.
          onChange([...valeur, cree.id])
          setRecherche("")
        },
        onError: (erreur) =>
          toast.error(erreur.message || "Erreur lors de la création du bénéficiaire."),
      },
    )
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-2.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un bénéficiaire..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtres.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {terme
            ? "Aucun bénéficiaire ne correspond à la recherche."
            : "Aucun bénéficiaire enregistré."}
        </p>
      ) : (
        filtres.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <Checkbox id={`beneficiaire-${b.id}`} checked={valeur.includes(b.id)} onCheckedChange={() => basculer(b.id)} />
            <Label htmlFor={`beneficiaire-${b.id}`} className="font-normal">{b.nom}</Label>
          </div>
        ))
      )}

      {propositionCreation && (
        <button
          type="button"
          onClick={creerBeneficiaire}
          disabled={creation.isPending}
          className="flex items-center gap-1.5 self-start rounded-md border border-dashed border-[var(--color-brand)] px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          Créer « {terme} »
        </button>
      )}
    </div>
  )
}