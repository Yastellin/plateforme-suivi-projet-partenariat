// src/features/espace-public/components/SectionPartenairesEnVedette.tsx
// Partenariats en vedette : grille de cartes partenaires (donnees de l'accueil).
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

export function SectionPartenairesEnVedette() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une?.slice(0, 6) ?? []
  if (!isLoading && partenaires.length === 0) return null

  return (
    <section className="vt-section" id="partenariats" aria-labelledby="titre-partenariats">
      <div className="vt-wrap">
        <Reveal className="vt-head">
          <div>
            <span className="vt-eyebrow">Partenariats</span>
            <h2 id="titre-partenariats">Partenariats en vedette</h2>
            <p>Entreprises, institutions et universités qui travaillent avec l'université.</p>
          </div>
          <Link to="/partenariats" className="vt-btn vt-btn-ghost">
            Voir tous les partenariats <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        {isLoading ? (
          <div className="vt-pt-grid">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <RevealGroup className="vt-pt-grid">
            {partenaires.map((partenaire) => (
              <RevealItem key={partenaire.id} className="h-full">
                <CartePartenaire partenaire={partenaire} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
