// Projets publics de l'accueil présentés sous forme de tableau de bord.
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjetDashboard } from "@/features/espace-public/components/CartesPubliques"
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
          <div className="vt-project-dashboard-grid" aria-busy="true">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          </div>
        ) : (
          <RevealGroup className="vt-project-dashboard-grid" direction="right">
            {projets.map((projet) => (
              <RevealItem key={projet.id} className="vt-project-dashboard-item">
                <CarteProjetDashboard projet={projet} lien={`/projets/${projet.id}`} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
        <BoutonVoirTout lien="/projets" libelle="Voir tous les projets" direction="right" />
      </div>
    </section>
  )
}
