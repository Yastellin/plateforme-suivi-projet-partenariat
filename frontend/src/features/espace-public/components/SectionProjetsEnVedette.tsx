// src/features/espace-public/components/SectionProjetsEnVedette.tsx
// Projets publics de l'accueil, en grille ou carte mise en avant selon le nombre.
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteMiseEnAvant, CarteProjet, CarteStandard } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { BoutonVoirTout, EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionProjetsEnVedette() {
  const { data, isLoading } = usePublicAccueil()
  const projets = data?.projets_a_la_une?.slice(0, 4) ?? []
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
          surTitre="DÉVELOPPEMENT RÉGIONAL"
          titre="Nos"
          titreAccent="Projets"
          sousTitre="Projets publics et collaborations de l'université."
          direction="right"
        />
        {isLoading ? (
          <div className="vt-accueil-card-grid">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <RevealGroup
            className={`vt-accueil-card-grid${projets.length === 1 ? " vt-card-grid-single" : ` vt-card-grid-${projets.length}`}`}
            direction="right"
          >
            {projets.map((projet) => (
              <RevealItem key={projet.id} className="vt-card-list-item h-full">
                {projets.length === 1 ? (
                  <CarteMiseEnAvant>
                    <CarteProjet projet={projet} lien={`/projets/${projet.id}`} />
                  </CarteMiseEnAvant>
                ) : (
                  <CarteStandard>
                    <CarteProjet projet={projet} lien={`/projets/${projet.id}`} />
                  </CarteStandard>
                )}
              </RevealItem>
            ))}
          </RevealGroup>
        )}
        <BoutonVoirTout lien="/projets" libelle="Voir tous les projets" direction="right" />
      </div>
    </section>
  )
}
