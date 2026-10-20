// src/features/espace-public/components/SectionProjetsAlaUne.tsx
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import { decouper } from "@/features/espace-public/lib/publique"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

// Carrousel des projets a la une : nom, etablissement, statut, description,
// periode et partenaires de chaque projet.
export function SectionProjetsAlaUne() {
  const { data, isLoading } = usePublicAccueil()
  const projets = data?.projets_a_la_une ?? []

  if (!isLoading && projets.length === 0) return null
  const diapositives = decouper(projets, 3)

  return (
    <section className="vt-section">
      <div className="vt-wrap">
      <EnTeteSection
        etiquette="Réalisations"
        titre="Projets à la une"
        description="Des projets menés par les établissements de l'Université, avec leurs partenaires."
        lien={{ to: "/projets-partenariats?onglet=projets", libelle: "Tous les projets" }}
      />

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
      </div>
    </section>
  )
}
