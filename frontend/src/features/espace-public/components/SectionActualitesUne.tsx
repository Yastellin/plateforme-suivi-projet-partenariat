// src/features/espace-public/components/SectionActualitesUne.tsx
// Actualites a la une de l'accueil : les 3 dernieres publications de la Presidence.
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

export function SectionActualitesUne() {
  const { data, isLoading } = usePublicAccueil()
  const publications = data?.dernieres_publications?.slice(0, 3) ?? []
  if (!isLoading && publications.length === 0) return null

  return (
    <section className="vt-section" id="actualites" aria-labelledby="titre-actualites">
      <div className="vt-wrap">
        <Reveal className="vt-head" direction="right">
          <div>
            <span className="vt-eyebrow">Actualités</span>
            <h2 id="titre-actualites">Actualités à la une</h2>
            <p>Les dernières publications de la Présidence de l'université.</p>
          </div>
          <Link to="/actualites" className="vt-btn vt-btn-ghost">
            Voir toutes les actualités <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        {isLoading ? (
          <div className="vt-grid-p">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <RevealGroup className="vt-grid-p" direction="right">
            {publications.map((publication) => (
              <RevealItem key={publication.id} className="h-full">
                <CartePublication publication={publication} lien={`/projets-partenariats/publication/${publication.id}`} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
