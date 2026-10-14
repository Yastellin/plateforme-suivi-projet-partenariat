// src/features/espace-public/pages/ProjetsPartenariatsPubliquePage.tsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { Newspaper, Search, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

// Page "Projets & partenariats" de la vitrine publique (section 7.4 :
// "Projets et Partenariats → publications publiees, filtres simples →
// detail d'une publication").
export function ProjetsPartenariatsPubliquePage() {
  const [recherche, setRecherche] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)

  const { data, isLoading } = usePublicPublications({
    recherche: rechercheDebounced || undefined,
    limit: 24,
  })

  const publications = data?.data ?? []

  return (
    <div className="pb-24">
      <PageHeaderPublique
        etiquette="Publications"
        icone={Newspaper}
        titre="Projets & partenariats"
        description="Consultez les publications et résultats de nos projets et partenariats en cours ou terminés."
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une publication..."
            className="h-12 rounded-full border-border/70 bg-background/80 pl-11 shadow-sm backdrop-blur"
          />
        </div>
      </PageHeaderPublique>

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Liste des publications */}
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))
          : publications.map((publication) => (
              <RevealItem key={publication.id}>
              <Link
                to={`/projets-partenariats/publication/${publication.id}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/10">
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                        {publication.titre}
                      </h3>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Publiée
                      </span>
                    </div>
                    {publication.description_publique && (
                      <p className="line-clamp-3 text-xs text-muted-foreground">
                        {publication.description_publique}
                      </p>
                    )}
                    {publication.resultats && (
                      <p className="line-clamp-2 text-xs text-muted-foreground italic">
                        Résultats : {publication.resultats}
                      </p>
                    )}
                    {publication.date_publication && (
                      <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {new Date(
                          publication.date_publication
                        ).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    )}
                    {publication.photos &&
                      publication.photos.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {publication.photos.slice(0, 3).map((photo) => (
                            <img
                              key={photo.id}
                              src={photo.url_fichier}
                              alt={photo.legende ?? ""}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ))}
                          {publication.photos.length > 3 && (
                            <span className="flex h-16 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                              +{publication.photos.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>
              </Link>
              </RevealItem>
            ))}
      </RevealGroup>

      {!isLoading && publications.length === 0 && (
        <EmptyState
          icone={Newspaper}
          titre="Aucune publication trouvée"
          description={
            recherche
              ? "Aucune publication ne correspond à votre recherche."
              : "Aucune publication n'est actuellement disponible."
          }
        />
      )}
      </div>
    </div>
  )
}
