// src/features/espace-public/pages/ProjetsPartenariatsPubliquePage.tsx

import { useState, type ReactElement } from "react"
import { Building2, Handshake, Search, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicProjets } from "@/features/espace-public/api/usePublicProjets"
import { usePublicPartenariats } from "@/features/espace-public/api/usePublicPartenariats"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealItem } from "@/features/espace-public/components/Reveal"
import { formaterDate } from "@/lib/format"
import { StatusBadge } from "@/components/shared/StatusBadge"

// Page "Projets & partenariats" de la vitrine publique : liste les projets et
// partenariats publies par la Presidence.
export function ProjetsPartenariatsPubliquePage() {
  const [recherche, setRecherche] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)

  const { data: projets, isLoading: projetsEnChargement } = usePublicProjets()
  const {
    data: partenariats,
    isLoading: partenariatsEnChargement,
  } = usePublicPartenariats()

  const projetsListe = (projets ?? []).filter((p) => {
    if (!rechercheDebounced) return true
    const terme = rechercheDebounced.toLowerCase()
    return (
      p.nom.toLowerCase().includes(terme) ||
      (p.intitule_officiel ?? "").toLowerCase().includes(terme) ||
      p.type.toLowerCase().includes(terme)
    )
  })

  const partenariatsListe = (partenariats ?? []).filter((p) => {
    if (!rechercheDebounced) return true
    const terme = rechercheDebounced.toLowerCase()
    return (
      p.intitule.toLowerCase().includes(terme) ||
      (p.objet ?? "").toLowerCase().includes(terme) ||
      p.domaine.toLowerCase().includes(terme)
    )
  })

  const enChargement = projetsEnChargement || partenariatsEnChargement

  return (
    <div className="pb-24">
      <PageHeaderPublique
        etiquette="Vitrine publique"
        icone={Building2}
        titre="Projets & partenariats"
        description="Consultez les projets et partenariats publies par la Presidence."
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un projet ou un partenariat..."
            className="h-12 rounded-full border-border/70 bg-background/80 pl-11 shadow-sm backdrop-blur"
          />
        </div>
      </PageHeaderPublique>

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionEntite
          titre="Projets publies"
          icone={Building2}
          vide="Aucun projet publie pour le moment."
          items={projetsListe}
          enChargement={projetsEnChargement}
          renderItem={(projet) => (
            <RevealItem key={projet.id}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                      {projet.nom}
                    </h3>
                    <StatusBadge libelle="Publie" tonalite="actif" />
                  </div>
                  {projet.intitule_officiel && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {projet.intitule_officiel}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-medium">{projet.type}</span>
                    {projet.etablissement_nom && (
                      <>
                        <span className="text-[var(--color-text-secondary)]">·</span>
                        {projet.etablissement_nom}
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>{formaterDate(projet.date_fin_prevue)}</span>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          )}
        />

        <SectionEntite
          titre="Partenariats publies"
          icone={Handshake}
          vide="Aucun partenariat publie pour le moment."
          items={partenariatsListe}
          enChargement={partenariatsEnChargement}
          renderItem={(partenariat) => (
            <RevealItem key={partenariat.id}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                      {partenariat.intitule}
                    </h3>
                    <StatusBadge libelle="Publie" tonalite="actif" />
                  </div>
                  {partenariat.objet && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {partenariat.objet}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-medium">{partenariat.domaine}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {partenariat.etablissements
                      .slice(0, 3)
                      .map((etab) => (
                        <span key={etab.id} className="flex items-center gap-1">
                          <Building2 size={12} />
                          {etab.nom}
                        </span>
                      ))}
                    {partenariat.etablissements.length > 3 && (
                      <span className="text-[var(--color-text-secondary)]">
                        +{partenariat.etablissements.length - 3}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          )}
        />

        {!enChargement && projetsListe.length === 0 && partenariatsListe.length === 0 && (
          <EmptyState
            icone={Building2}
            titre="Aucun résultat trouvé"
            description={
              recherche
                ? "Aucun projet ou partenariat ne correspond à votre recherche."
                : "Aucun projet ou partenariat n'est actuellement publié."
            }
          />
        )}
      </div>
    </div>
  )
}

function SectionEntite<T>({
  titre,
  icone: Icone,
  vide,
  items,
  enChargement,
  renderItem,
}: {
  titre: string
  icone: any
  vide: string
  items: T[]
  enChargement: boolean
  renderItem: (item: T) => ReactElement
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-base font-semibold text-foreground">{titre}</h2>
      <div className="border rounded-[var(--radius)] border-border bg-background p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enChargement ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : items.length === 0 ? (
            <EmptyState icone={Icone} titre={vide} description="" />
          ) : (
            items.map((item) => renderItem(item))
          )}
        </div>
      </div>
    </div>
  )
}