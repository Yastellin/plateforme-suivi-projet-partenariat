// src/features/espace-public/components/SectionPartenariats.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariat } from "@/features/espace-public/components/CartesPubliques"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

export function SectionPartenariats() {
  const { data, isLoading } = usePublicPartenariatsPublies()
  const partenariats = data?.slice(0, 3) ?? []

  if (!isLoading && partenariats.length === 0) return null

  return (
    <section className="vt-section vt-section-alt" id="partenariats" aria-labelledby="titre-partenariats">
      <div className="vt-wrap">
        <Reveal className="vt-head" direction="left">
          <div>
            <span className="vt-eyebrow">Coopérations</span>
            <h2 id="titre-partenariats">Partenariats</h2>
            <p>Les relations de coopération entre les établissements et leurs partenaires.</p>
          </div>
          <Link to="/partenariats" className="vt-btn vt-btn-ghost">
            Voir tous les partenariats <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        {isLoading ? (
          <div className="vt-grid-p">
            {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-72" />)}
          </div>
        ) : (
          <RevealGroup className="vt-grid-p" direction="left">
            {partenariats.map((partenariat) => (
              <RevealItem key={partenariat.id} className="h-full">
                <CartePartenariat partenariat={partenariat} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
