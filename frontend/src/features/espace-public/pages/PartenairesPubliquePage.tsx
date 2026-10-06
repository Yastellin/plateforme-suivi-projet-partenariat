// src/features/espace-public/pages/PartenairesPubliquePage.tsx
import { useState } from "react"
import { Handshake, Search, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { obtenirInfoStatut } from "@/lib/status-mappings"

// Page Partenaires de la vitrine publique (section 6.2).
// Liste publique des partenaires avec visibilite = PUBLIC (RG cf.
// Partenaire.visibilite). Recherche + filtres simples.
export function PartenairesPubliquePage() {
  const [recherche, setRecherche] = useState("")
  const [pays, setPays] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)

  const { data, isLoading } = usePublicPartenaires({
    recherche: rechercheDebounced || undefined,
    pays: pays || undefined,
    limit: 24,
  })

  const partenaires = data?.data ?? []

  // Extraire les pays uniques pour le filtre
  const paysUniques = Array.from(
    new Set(partenaires.map((p) => p.pays).filter(Boolean))
  ).sort()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Nos partenaires
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Découvrez les organisations et institutions qui collaborent
          avec l'Université de Fianarantsoa.
        </p>
      </div>

      {/* Filtres */}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un partenaire..."
            className="pl-9"
          />
        </div>
        {paysUniques.length > 0 && (
          <div className="relative">
            <Globe
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground"
            >
              <option value="">Tous les pays</option>
              {paysUniques.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grille de partenaires */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))
          : partenaires.map((partenaire) => (
              <Card
                key={partenaire.id}
                className="transition-colors hover:bg-accent/50"
              >
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      {partenaire.logo_url ? (
                        <img
                          src={partenaire.logo_url}
                          alt={partenaire.nom}
                          className="h-8 w-8 rounded object-contain"
                        />
                      ) : (
                        <Handshake size={24} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-medium text-foreground">
                        {partenaire.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {partenaire.type}
                      </p>
                    </div>
                    <StatusBadge libelle={obtenirInfoStatut(partenaire.statut).libelle} tonalite={obtenirInfoStatut(partenaire.statut).tonalite} />
                  </div>
                  {partenaire.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {partenaire.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe size={12} />
                      {partenaire.pays}
                    </span>
                    {partenaire.est_strategique && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium">
                        Stratégique
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && partenaires.length === 0 && (
        <EmptyState
          icone={Handshake}
          titre="Aucun partenaire trouvé"
          description={
            recherche || pays
              ? "Aucun partenaire ne correspond à vos critères."
              : "Aucun partenaire n'est actuellement visible publiquement."
          }
        />
      )}
    </div>
  )
}
