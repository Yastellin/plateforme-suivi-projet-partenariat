// src/features/recherche/pages/RecherchePage.tsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { FilterChips } from "@/components/shared/FilterChips"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"

type TypeRecherche = "TOUT" | "PARTENAIRES" | "PARTENARIATS" | "PROJETS" | "CONVENTIONS" | "COTUTELLES"

interface ResultatRecherche {
  id: string
  type: string
  titre: string
  description?: string
}

const OPTIONS_FILTRE = [
  { cle: 'TOUT', libelle: 'Tous' },
  { cle: 'PARTENAIRES', libelle: 'Partenaires' },
  { cle: 'PARTENARIATS', libelle: 'Partenariats' },
  { cle: 'PROJETS', libelle: 'Projets' },
  { cle: 'CONVENTIONS', libelle: 'Conventions' },
  { cle: 'COTUTELLES', libelle: 'Cotutelles' },
]

function cheminDetail(role: RoleUtilisateur, type: string, id: string): string {
  const prefixe = role === "PRESIDENCE" ? "presidence" : role === "ETABLISSEMENT" ? "etablissement" : "decideur"
  const typeRoute = type.toLowerCase() + "s"
  return `/${prefixe}/${typeRoute}/${id}`
}

export function RecherchePage() {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [recherche, setRecherche] = useState("")
  const [type, setType] = useState<TypeRecherche>("TOUT")
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data: resultats, isLoading } = useQuery({
    queryKey: ["recherche", rechercheDebouncee, type],
    queryFn: async () => {
      const reponse = await apiClient.get<ResultatRecherche[]>("/recherche", {
        params: { q: rechercheDebouncee, type },
      })
      return reponse.data
    },
    enabled: rechercheDebouncee.length >= 2,
  })

  return (
    <div>
      <PageHeader
        titre="Recherche"
        description="Recherchez un partenaire, projet, convention…"
      />

      <Panel>
        <PanelBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un partenaire, projet, convention…"
                className="h-10 pl-10 text-[14px]"
              />
            </div>
            <FilterChips
              options={OPTIONS_FILTRE}
              valeur={type}
              onChange={(valeur) => setType(valeur as TypeRecherche)}
            />
          </div>
        </PanelBody>
      </Panel>

      <div className="mt-[22px]">
        {rechercheDebouncee.length < 2 ? (
          <EmptyState
            icone={Search}
            titre="Lancez une recherche"
            description="Saisissez au moins 2 caractères pour lancer la recherche."
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-16 w-full" />
            ))}
          </div>
        ) : resultats && resultats.length > 0 ? (
          <Panel>
            <PanelBody>
              <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
                {resultats.length} résultat{resultats.length > 1 ? "s" : ""} trouvé{resultats.length > 1 ? "s" : ""}
              </p>
              <div className="flex flex-col gap-2">
                {resultats.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    type="button"
                    onClick={() => navigate(cheminDetail(utilisateur?.role ?? "PRESIDENCE", r.type, r.id))}
                    className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-left transition-colors hover:bg-[var(--color-page-bg)]"
                  >
                    <Badge variant="outline" className="mt-0.5 shrink-0 text-[11px]">{r.type}</Badge>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-[var(--color-text-primary)]">{r.titre}</p>
                      {r.description && <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-1">{r.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </PanelBody>
          </Panel>
        ) : (
          <EmptyState
            icone={Search}
            titre="Aucun résultat"
            description={`Aucun résultat pour « ${rechercheDebouncee} » avec le filtre sélectionné.`}
          />
        )}
      </div>
    </div>
  )
}
