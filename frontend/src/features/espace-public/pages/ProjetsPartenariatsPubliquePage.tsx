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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Projets & partenariats
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Consultez les publications et résultats de nos projets et
          partenariats en cours ou terminés.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mx-auto mt-8 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une publication..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Liste des publications */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link
                key={publication.id}
                to={`/projets-partenariats/publication/${publication.id}`}
                className="group"
              >
                <Card className="h-full transition-colors group-hover:bg-accent/50">
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                        {publication.titre}
                      </h3>
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
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
            ))}
      </div>

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
  )
}
