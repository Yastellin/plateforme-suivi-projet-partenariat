// src/features/projets/components/SelectionBailleurs.tsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCreateBailleur } from "@/features/referentiels/api/useCreateBailleur"
import type { Bailleur } from "@/types/api"

interface SelectionBailleursProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionBailleurs({ valeur, onChange }: SelectionBailleursProps) {
  const [recherche, setRecherche] = useState("")
  const creation = useCreateBailleur()

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

  // Combobox : la recherche filtre la liste et permet de creer un bailleur
  // a la volee quand aucun resultat ne correspond au terme saisi.
  const terme = recherche.trim()
  const filtres = terme
    ? (bailleurs ?? []).filter((b) =>
        b.nom.toLowerCase().includes(terme.toLowerCase()),
      )
    : bailleurs ?? []
  const propositionCreation = terme.length >= 2 && filtres.length === 0 && !isLoading

  const creerBailleur = () => {
    creation.mutate(
      { nom: terme },
      {
        onSuccess: (cree) => {
          // L'element cree est automatiquement coche dans le formulaire.
          onChange([...valeur, cree.id])
          setRecherche("")
        },
        onError: (erreur) =>
          toast.error(erreur.message || "Erreur lors de la création du bailleur."),
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
          placeholder="Rechercher un bailleur..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtres.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {terme
            ? "Aucun bailleur ne correspond à la recherche."
            : "Aucun bailleur enregistré."}
        </p>
      ) : (
        filtres.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <Checkbox id={`bailleur-${b.id}`} checked={valeur.includes(b.id)} onCheckedChange={() => basculer(b.id)} />
            <Label htmlFor={`bailleur-${b.id}`} className="font-normal">{b.nom}</Label>
          </div>
        ))
      )}

      {propositionCreation && (
        <button
          type="button"
          onClick={creerBailleur}
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