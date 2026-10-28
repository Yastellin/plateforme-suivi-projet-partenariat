// src/features/espace-public/components/SectionProjetsEnVedette.tsx
// Projets publics de l'accueil : trois cartes, défilement horizontal sur mobile.
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionProjetsEnVedette() {
  const { data, isLoading } = usePublicAccueil()
  const projets = data?.projets_a_la_une?.slice(0, 3) ?? []
  if (!isLoading && projets.length === 0) return null

  return (
    <section
      className="vt-section vt-section-alt"
      id="projets"
      aria-labelledby="titre-projets"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-projets"
          titre="Projets"
          sousTitre="Projets publics et collaborations de l'université."
          lienVoirTout="/projets"
          libelleVoirTout="Voir tous les projets"
          direction="right"
        />
        {isLoading ? (
          <div className="vt-grid-p">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <RevealGroup className="vt-grid-p vt-hscroll" direction="right">
            {projets.map((projet) => (
              <RevealItem key={projet.id} className="h-full">
                <CarteProjet
                  projet={projet}
                  lien={
                    projet.publication_id
                      ? `/projets-partenariats/publication/${projet.publication_id}`
                      : `/projets/${projet.id}`
                  }
                />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
