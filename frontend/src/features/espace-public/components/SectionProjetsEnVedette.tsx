// Projets publics de l'accueil présentés en cartes chronologiques.
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjetTimeCard } from "@/features/espace-public/components/CartesPubliques"
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
          <div className="vt-projects-list vt-projects-list-home" aria-busy="true">
            {[...Array(4)].map((_, index) => <Skeleton key={index} className="vt-time-card-skeleton rounded-xl" />)}
          </div>
        ) : (
          <RevealGroup className="vt-projects-list vt-projects-list-home" direction="right">
            {projets.map((projet) => (
              <RevealItem key={projet.id} className="vt-project-time-item">
                <CarteProjetTimeCard projet={projet} lien={`/projets/${projet.id}`} variante="accueil" />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
        <BoutonVoirTout lien="/projets" libelle="Voir tous les projets" direction="right" />
      </div>
    </section>
  )
}
