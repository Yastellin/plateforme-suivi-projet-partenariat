// src/features/recherche/pages/RecherchePage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
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

const FILTRES_TYPE: { value: TypeRecherche; label: string }[] = [
  { value: "TOUT", label: "Tous" },
  { value: "PARTENAIRES", label: "Partenaires" },
  { value: "PARTENARIATS", label: "Partenariats" },
  { value: "PROJETS", label: "Projets" },
  { value: "CONVENTIONS", label: "Conventions" },
  { value: "COTUTELLES", label: "Cotutelles" },
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
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Recherche</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un partenaire, projet, convention..."
            className="h-10 pl-10 text-[14px]"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex gap-1">
          {FILTRES_TYPE.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                type === f.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rechercheDebouncee.length < 2 ? (
        <EmptyState
          icon={Search}
          titre="Lancez une recherche"
          message="Saisissez au moins 2 caracteres pour lancer la recherche."
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : resultats && resultats.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""} trouvé{resultats.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-2">
            {resultats.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => navigate(cheminDetail(utilisateur?.role ?? "PRESIDENCE", r.type, r.id))}
                className="flex items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <Badge variant="outline" className="mt-0.5 shrink-0 text-[11px]">{r.type}</Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.titre}</p>
                  {r.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          titre="Aucun résultat"
          message={`Aucun résultat pour « ${rechercheDebouncee} » avec le filtre sélectionné.`}
        />
      )}
    </div>
  )
}
