// src/features/espace-public/components/SectionActualitesUne.tsx
// Dernières actualités publiques de l'accueil, en grille ou carte mise en avant selon le nombre.
import { Newspaper } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteMiseEnAvant, CartePublication, CarteStandard } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { BoutonVoirTout, EnTeteSection } from "@/features/espace-public/components/EnTeteSection"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

export function SectionActualitesUne() {
  const { data, isLoading } = usePublicAccueil()
  const publications = data?.dernieres_publications?.slice(0, 4) ?? []

  return (
    <section
      className="vt-section"
      id="actualites"
      aria-labelledby="titre-actualites"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-actualites"
          surTitre="DERNIÈRES PUBLICATIONS"
          titre="Nos"
          titreAccent="Actualités"
          sousTitre="Les dernières publications de la Présidence de l'université."
          direction="right"
        />
        {isLoading ? (
          <div className="vt-accueil-card-grid">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <EmptyStateSection
            icone={<Newspaper aria-hidden="true" />}
            titre="Aucune actualité pour le moment"
            description="Nous préparons de nouveaux articles et communiqués. Revenez très bientôt pour découvrir les dernières nouvelles de l'université."
            actionLibelle="Voir les archives"
            actionHref="/actualites"
          />
        ) : (
          <RevealGroup
            className={`vt-accueil-card-grid${publications.length === 1 ? " vt-card-grid-single" : ` vt-card-grid-${publications.length}`}`}
            direction="right"
          >
            {publications.map((publication) => (
              <RevealItem key={publication.id} className="vt-card-list-item h-full">
                {publications.length === 1 ? (
                  <CarteMiseEnAvant>
                    <CartePublication publication={publication} lien={`/actualites/${publication.id}`} />
                  </CarteMiseEnAvant>
                ) : (
                  <CarteStandard>
                    <CartePublication publication={publication} lien={`/actualites/${publication.id}`} />
                  </CarteStandard>
                )}
              </RevealItem>
            ))}
          </RevealGroup>
        )}
        {publications.length > 0 && <BoutonVoirTout lien="/actualites" libelle="Voir toutes les actualités" direction="right" />}
      </div>
    </section>
  )
}
