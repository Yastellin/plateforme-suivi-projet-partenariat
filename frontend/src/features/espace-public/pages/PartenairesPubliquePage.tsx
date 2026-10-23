// src/features/espace-public/pages/PartenairesPubliquePage.tsx
import { useState } from "react"
import { Handshake, Search, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { LogoMedia } from "@/components/shared/ImageMedia"

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
    <div className="pb-24">
      <PageHeaderPublique
        etiquette="Écosystème"
        icone={Handshake}
        titre="Nos partenaires"
        description="Découvrez les organisations et institutions qui collaborent avec l'Université de Fianarantsoa."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un partenaire..."
              className="h-12 rounded-full border-border/70 bg-background/80 pl-11 shadow-sm backdrop-blur"
            />
          </div>
          {paysUniques.length > 0 && (
            <div className="relative">
              <Globe
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <select
                value={pays}
                onChange={(e) => setPays(e.target.value)}
                className="h-12 w-full appearance-none rounded-full border border-border/70 bg-background/80 pl-11 pr-6 text-sm text-foreground shadow-sm backdrop-blur sm:w-56"
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
      </PageHeaderPublique>

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Grille de partenaires */}
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <RevealItem key={partenaire.id}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-background text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105">
                      <LogoMedia
                        src={partenaire.logo_url}
                        nom={partenaire.nom}
                        className="h-8 w-8 rounded object-contain text-xs"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-medium text-foreground">
                        {partenaire.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {partenaire.type}
                      </p>
                    </div>
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
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                        Stratégique
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              </RevealItem>
            ))}
      </RevealGroup>

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
    </div>
  )
}
