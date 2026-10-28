// src/features/espace-public/components/SectionPartenaires.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { BandeLogos } from "@/features/espace-public/components/BandeLogos"
import { Reveal } from "@/features/espace-public/components/Reveal"

export function SectionPartenaires() {
  const { data, isLoading } = usePublicPartenaires({ page: 1, limit: 100 })
  const partenaires = data?.data ?? []

  return (
    <section className="vt-section" id="partenaires" aria-labelledby="titre-partenaires">
      <div className="vt-wrap">
        <Reveal className="vt-head" direction="left">
          <div>
            <span className="vt-eyebrow">Partenaires</span>
            <h2 id="titre-partenaires">Partenaires</h2>
            <p>Les organisations qui collaborent avec l'Université de Fianarantsoa.</p>
          </div>
          <Link to="/partenaires" className="vt-btn vt-btn-ghost">
            Voir tous les partenaires <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        {isLoading ? (
          <div className="vt-partner-logos-loading" aria-label="Chargement des partenaires" aria-busy="true">
            {[...Array(5)].map((_, index) => <Skeleton key={index} className="h-16 w-36" />)}
          </div>
        ) : partenaires.length > 0 ? (
          <Reveal direction="left">
            <BandeLogos partenaires={partenaires.filter((partenaire) => partenaire.logo_url)} />
          </Reveal>
        ) : (
          <p className="vt-muted" role="status">Aucun partenaire public n'est disponible pour le moment.</p>
        )}
      </div>
    </section>
  )
}
