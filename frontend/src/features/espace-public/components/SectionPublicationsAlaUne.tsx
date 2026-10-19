// src/features/espace-public/components/SectionPublicationsAlaUne.tsx
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { decouper } from "@/features/espace-public/lib/publique"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

// Carrousel des dernieres publications de la Presidence (statut PUBLIEE).
export function SectionPublicationsAlaUne() {
  const { data, isLoading } = usePublicAccueil()
  const publications = data?.dernieres_publications ?? []

  if (!isLoading && publications.length === 0) return null
  const diapositives = decouper(publications, 3)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <EnTeteSection
        etiquette="Actualités"
        titre="Publications récentes"
        description="Les dernières actualités publiées par la Présidence de l'Université."
        lien={{ to: "/projets-partenariats?onglet=publications", libelle: "Toutes les publications" }}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <HybridCarousel
          libelle="Publications récentes"
          items={diapositives}
          cleItem={(groupe) => groupe.map((p) => p.id).join("-")}
          renderItem={(groupe) => (
            <div className="grid gap-6 px-1 md:grid-cols-2 lg:grid-cols-3">
              {groupe.map((publication) => (
                <CartePublication key={publication.id} publication={publication} />
              ))}
            </div>
          )}
        />
      )}
    </section>
  )
}
