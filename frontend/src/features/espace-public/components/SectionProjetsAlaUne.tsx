// src/features/espace-public/components/SectionProjetsAlaUne.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import { decouper } from "@/features/espace-public/lib/publique"

// Carrousel des projets a la une : nom, etablissement, statut, description,
// periode et partenaires de chaque projet.
export function SectionProjetsAlaUne() {
  const { data, isLoading } = usePublicAccueil()
  const projets = data?.projets_a_la_une ?? []

  if (!isLoading && projets.length === 0) return null
  const diapositives = decouper(projets, 3)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Réalisations</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-foreground">Projets à la une</h2>
        </div>
        <Link to="/projets-partenariats?onglet=projets" className="group flex items-center gap-1 text-sm font-medium text-primary">
          Tous les projets
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <HybridCarousel
          libelle="Projets à la une"
          items={diapositives}
          cleItem={(groupe) => groupe.map((p) => p.id).join("-")}
          renderItem={(groupe) => (
            <div className="grid gap-6 px-1 md:grid-cols-2 lg:grid-cols-3">
              {groupe.map((projet) => (
                <CarteProjet key={projet.id} projet={projet} />
              ))}
            </div>
          )}
        />
      )}
    </section>
  )
}
