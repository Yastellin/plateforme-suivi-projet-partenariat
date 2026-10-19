// src/features/projets/components/SelectionSites.tsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCreateSite } from "@/features/referentiels/api/useCreateSite"
import type { Site } from "@/types/api"

interface SelectionSitesProps {
  valeur: string[]
  onChange: (ids: string[]) => void
}

export function SelectionSites({ valeur, onChange }: SelectionSitesProps) {
  const [recherche, setRecherche] = useState("")
  const creation = useCreateSite()

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

  // Combobox : la recherche filtre la liste et permet de creer un site
  // a la volee quand aucun resultat ne correspond au terme saisi.
  const terme = recherche.trim()
  const filtres = terme
    ? (sites ?? []).filter((s) =>
        s.nom.toLowerCase().includes(terme.toLowerCase()),
      )
    : sites ?? []
  const propositionCreation = terme.length >= 2 && filtres.length === 0 && !isLoading

  const creerSite = () => {
    creation.mutate(
      { nom: terme },
      {
        onSuccess: (cree) => {
          // L'element cree est automatiquement coche dans le formulaire.
          onChange([...valeur, cree.id])
          setRecherche("")
        },
        onError: (erreur) =>
          toast.error(erreur.message || "Erreur lors de la création du site."),
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
          placeholder="Rechercher un site..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtres.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {terme
            ? "Aucun site ne correspond à la recherche."
            : "Aucun site enregistré."}
        </p>
      ) : (
        filtres.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <Checkbox id={`site-${s.id}`} checked={valeur.includes(s.id)} onCheckedChange={() => basculer(s.id)} />
            <Label htmlFor={`site-${s.id}`} className="font-normal">{s.nom}</Label>
          </div>
        ))
      )}

      {propositionCreation && (
        <button
          type="button"
          onClick={creerSite}
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