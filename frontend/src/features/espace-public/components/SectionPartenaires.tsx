// src/features/espace-public/components/SectionPartenaires.tsx
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { decouper } from "@/features/espace-public/lib/publique"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

// Carrousel des partenaires a la une, avec description de chaque partenaire.
export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []

  if (!isLoading && partenaires.length === 0) return null
  const diapositives = decouper(partenaires, 4)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <EnTeteSection
        etiquette="Coopération"
        titre="Nos partenaires"
        description="Les institutions qui accompagnent l'Université dans ses projets de recherche et de formation."
        lien={{ to: "/projets-partenariats?onglet=partenaires", libelle: "Tous les partenaires" }}
      />

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
