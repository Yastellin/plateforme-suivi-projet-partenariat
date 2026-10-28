// src/features/espace-public/components/SectionProjetsEnVedette.tsx
// Projets en vedette : grille de 3 a 6 cartes, defilement horizontal sur mobile.
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

export function SectionProjetsEnVedette() {
  const { data, isLoading } = usePublicAccueil()
  const projets = data?.projets_a_la_une?.slice(0, 3) ?? []
  if (!isLoading && projets.length === 0) return null

  return (
    <section className="vt-section vt-section-alt" id="projets" aria-labelledby="titre-projets">
      <div className="vt-wrap">
        <Reveal className="vt-head" direction="right">
          <div>
            <span className="vt-eyebrow">Projets</span>
            <h2 id="titre-projets">Projets en vedette</h2>
            <p>Les projets publics de l'université, avec leurs partenaires et leur statut.</p>
          </div>
          <Link to="/projets" className="vt-btn vt-btn-ghost">
            Voir tous les projets <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
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
                  lien={projet.publication_id
                    ? `/projets-partenariats/publication/${projet.publication_id}`
                    : `/projets/${projet.id}`}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
