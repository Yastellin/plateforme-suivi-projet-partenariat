// src/features/espace-public/components/SectionPartenaires.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { decouper } from "@/features/espace-public/lib/publique"

// Carrousel des partenaires a la une, avec description de chaque partenaire.
export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []

  if (!isLoading && partenaires.length === 0) return null
  const diapositives = decouper(partenaires, 4)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Coopération</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground">Nos partenaires</h2>
        </div>
        <Link to="/projets-partenariats?onglet=partenaires" className="group flex items-center gap-1 text-sm font-medium text-primary">
          Tous les partenaires
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        <HybridCarousel
          libelle="Partenaires"
          items={diapositives}
          cleItem={(groupe) => groupe.map((p) => p.id).join("-")}
          renderItem={(groupe) => (
            <div className="grid gap-6 px-1 sm:grid-cols-2 xl:grid-cols-4">
              {groupe.map((partenaire) => (
                <CartePartenaire key={partenaire.id} partenaire={partenaire} />
              ))}
            </div>
          )}
        />
      )}
    </section>
  )
}
