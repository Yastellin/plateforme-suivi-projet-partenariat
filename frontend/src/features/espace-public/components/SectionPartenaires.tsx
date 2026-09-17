// src/features/espace-public/components/SectionPartenaires.tsx
import { Link } from "react-router-dom"
import { Handshake, ArrowRight } from "lucide-react"
import { InfiniteMarquee } from "@/components/shared/InfiniteMarquee"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"

// Section partenaires mis en avant sur la page d'accueil publique.
// Bandeau defilant en boucle infinie des logos partenaires (section 7.4 :
// "marquee infini de logos partenaires"). Pure CSS, aucune dependance externe.
export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []

  if (!isLoading && partenaires.length === 0) return null

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Nos partenaires
          </h2>
          <Link
            to="/partenaires"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir tous
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center gap-6 px-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <InfiniteMarquee
            items={partenaires}
            cleItem={(p) => p.id}
            renderItem={(partenaire) => (
              <div className="flex h-16 items-center gap-2 rounded-lg border border-border bg-card px-6 transition-colors hover:bg-accent/50">
                {partenaire.logo_url ? (
                  <img
                    src={partenaire.logo_url}
                    alt={partenaire.nom}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="flex items-center gap-2 font-heading text-sm font-medium text-muted-foreground">
                    <Handshake size={16} />
                    {partenaire.nom}
                  </span>
                )}
              </div>
            )}
            itemClassName="mx-5"
          />
        )}
      </div>
    </section>
  )
}
