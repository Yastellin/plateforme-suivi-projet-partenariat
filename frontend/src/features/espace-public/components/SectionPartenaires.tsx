// src/features/espace-public/components/SectionPartenaires.tsx
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { InfiniteMarquee } from "@/components/shared/InfiniteMarquee"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { Reveal } from "@/features/espace-public/components/Reveal"
import { LogoMedia } from "@/components/shared/ImageMedia"

// Section partenaires mis en avant sur la page d'accueil publique.
// Bandeau defilant en boucle infinie des logos partenaires (section 7.4 :
// "marquee infini de logos partenaires"), dans des pastilles en verre depoli.
export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []

  if (!isLoading && partenaires.length === 0) return null

  return (
    <section className="relative py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Confiance</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-foreground">
              Nos partenaires
            </h2>
          </div>
          <Link
            to="/partenaires"
            className="group flex items-center gap-1 text-sm font-medium text-primary"
          >
            Voir tous
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center gap-6 px-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <InfiniteMarquee
            items={partenaires}
            cleItem={(p) => p.id}
            renderItem={(partenaire) => (
              <div className="flex h-16 items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <LogoMedia
                  src={partenaire.logo_url}
                  nom={partenaire.nom}
                  className="h-8 w-8 flex-shrink-0 rounded object-contain text-xs"
                  loading="lazy"
                />
                <span className="max-w-48 truncate font-heading text-sm font-medium text-muted-foreground">
                  {partenaire.nom}
                </span>
              </div>
            )}
            itemClassName="mx-3"
          />
        )}
      </div>
    </section>
  )
}
