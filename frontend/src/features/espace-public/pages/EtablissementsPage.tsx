// src/features/espace-public/pages/EtablissementsPage.tsx
import { useState } from "react"
import { Building2, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicEtablissements } from "@/features/espace-public/api/usePublicEtablissements"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"

// Page Etablissements de la vitrine publique (section 6.2).
// Liste publique des etablissements membres avec recherche instantanee.
export function EtablissementsPage() {
  const [recherche, setRecherche] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)

  const { data, isLoading } = usePublicEtablissements({
    recherche: rechercheDebounced || undefined,
    limit: 24,
  })

  const etablissements = data?.data ?? []

  return (
    <div className="pb-24">
      <PageHeaderPublique
        titre="Établissements membres"
        description="Découvrez les établissements de l'Université de Fianarantsoa et leurs domaines de compétence."
        icone={Building2}
        etiquette="Réseau"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un établissement..."
            className="h-12 rounded-full border-border/70 bg-background/80 pl-11 shadow-sm backdrop-blur"
          />
        </div>
      </PageHeaderPublique>

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Grille d'etablissements */}
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-5">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          : etablissements.map((etab) => (
              <RevealItem key={etab.id}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-background text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105">
                    {etab.logo_url ? (
                      <img
                        src={etab.logo_url}
                        alt={etab.nom}
                        className="h-10 w-10 rounded object-contain"
                      />
                    ) : (
                      <ImageDefaut alt="" className="h-10 w-10 rounded object-contain" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-medium text-foreground">
                      {etab.nom}
                    </p>
                    {etab.sigle && (
                      <p className="text-xs text-muted-foreground">
                        {etab.sigle}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              </RevealItem>
            ))}
      </RevealGroup>

      {!isLoading && etablissements.length === 0 && (
        <EmptyState
          icone={Building2}
          titre="Aucun établissement trouvé"
          description={
            recherche
              ? "Aucun établissement ne correspond à votre recherche."
              : "Aucun établissement n'est actuellement disponible."
          }
        />
      )}
      </div>
    </div>
  )
}
