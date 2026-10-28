// src/features/espace-public/components/SectionActualitesUne.tsx
// Dernières actualités de l'accueil : les trois publications publiques récentes.
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionActualitesUne() {
  const { data, isLoading } = usePublicAccueil()
  const publications = data?.dernieres_publications?.slice(0, 3) ?? []
  if (!isLoading && publications.length === 0) return null

  return (
    <section
      className="vt-section"
      id="actualites"
      aria-labelledby="titre-actualites"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-actualites"
          titre="Actualités"
          sousTitre="Les dernières publications de la Présidence de l'université."
          lienVoirTout="/actualites"
          libelleVoirTout="Voir toutes les actualités"
          direction="right"
        />
        {isLoading ? (
          <div className="vt-grid-p vt-accueil-card-grid">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <RevealGroup className="vt-grid-p vt-accueil-card-grid" direction="right">
            {publications.map((publication) => (
              <RevealItem key={publication.id} className="h-full">
                <CartePublication
                  publication={publication}
                  lien={`/projets-partenariats/publication/${publication.id}`}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
