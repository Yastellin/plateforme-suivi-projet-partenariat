// src/features/espace-public/pages/PublicationDetailPage.tsx
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { obtenirInfoStatut } from "@/lib/status-mappings"
import apiClient from "@/lib/api-client"
import type { Publication } from "@/types/api"
import { useState } from "react"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

// Page detail d'une publication publique (section 7.4 : "detail d'une
// publication"). Accessible sans authentification.
export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: publication, isLoading, error } = useQuery({
    queryKey: ["public-publication", id],
    queryFn: async () => {
      const reponse = await apiClient.get<Publication>(
        `/public/publications/${id}`
      )
      return reponse.data
    },
    enabled: !!id,
  })
  useTitreBreadcrumb(publication?.titre)

  const [photoActive, setPhotoActive] = useState(0)
  const photos = publication?.photos ?? []

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full rounded-xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (error || !publication) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <Newspaper size={48} className="mx-auto text-muted-foreground" />
        <h1 className="mt-4 font-heading text-xl font-semibold text-foreground">
          Publication introuvable
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cette publication n'existe pas ou n'est plus disponible.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/projets-partenariats">
            <ArrowLeft size={16} />
            Retour aux publications
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Retour */}
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/projets-partenariats">
          <ArrowLeft size={16} />
          Retour
        </Link>
      </Button>

      {/* En-tete */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {publication.titre}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge libelle={obtenirInfoStatut(publication.statut).libelle} tonalite={obtenirInfoStatut(publication.statut).tonalite} />
            {publication.date_publication && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar size={14} />
                {new Date(publication.date_publication).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Galerie de photos */}
      {photos.length > 0 && (
        <div className="mt-8">
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img
              src={photos[photoActive].url_fichier}
              alt={photos[photoActive].legende ?? publication.titre}
              className="h-64 w-full object-cover sm:h-96"
            />
            {photos.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                  onClick={() =>
                    setPhotoActive((prev) =>
                      prev === 0 ? photos.length - 1 : prev - 1
                    )
                  }
                  aria-label="Photo précédente"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                  onClick={() =>
                    setPhotoActive((prev) =>
                      prev === photos.length - 1 ? 0 : prev + 1
                    )
                  }
                  aria-label="Photo suivante"
                >
                  <ChevronRight size={18} />
                </Button>
              </>
            )}
          </div>
          {/* Points de navigation */}
          {photos.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoActive(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === photoActive
                      ? "w-4 bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          {photos[photoActive].legende && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {photos[photoActive].legende}
            </p>
          )}
        </div>
      )}

      {/* Contenu */}
      <div className="mt-8 space-y-6">
        {publication.description_publique && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {publication.description_publique}
              </p>
            </CardContent>
          </Card>
        )}

        {publication.resultats && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
                Résultats obtenus
              </h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {publication.resultats}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
