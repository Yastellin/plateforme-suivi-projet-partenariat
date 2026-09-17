// src/features/espace-public/components/HeroAccueil.tsx
import { Link } from "react-router-dom"
import { Building2, Handshake, Globe, FolderKanban, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { InfiniteMarquee } from "@/components/shared/InfiniteMarquee"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"

// Section hero de la page d'accueil publique (section 7.4) :
// carrousel hybride des dernieres publications, compteurs animes,
// fade-in au scroll, marquee infini de logos partenaires.
export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()

  const publications = data?.dernieres_publications ?? []
  const etablissements = data?.etablissements_a_la_une ?? []
  const partenaires = data?.partenaires_a_la_une ?? []
  const compteurs = data?.compteurs

  return (
    <section className="flex flex-col gap-16">
      {/* Hero principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Université de Fianarantsoa
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Plateforme centralisée de suivi des projets et partenariats —
              pour une gestion transparente et efficace de la coopération universitaire.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/connexion">
                  Espace interne
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/projets-partenariats">Nos projets</Link>
              </Button>
            </div>
          </div>

          {/* Compteurs animes (section 7.4 : "compteurs animes") */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </>
            ) : compteurs ? (
              <>
                <AnimatedCounter
                  valeur={compteurs.nombre_etablissements}
                  label="Établissements"
                  icon={Building2}
                />
                <AnimatedCounter
                  valeur={compteurs.nombre_partenaires}
                  label="Partenaires"
                  icon={Handshake}
                />
                <AnimatedCounter
                  valeur={compteurs.nombre_pays_partenaires}
                  label="Pays partenaires"
                  prefixe="+"
                  icon={Globe}
                />
                <AnimatedCounter
                  valeur={compteurs.nombre_projets_actifs}
                  label="Projets actifs"
                  icon={FolderKanban}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Carrousel des publications (section 7.4 : "carrousel hybride") */}
      {publications.length > 0 && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
            Publications récentes
          </h2>
          <HybridCarousel
            items={publications}
            cleItem={(p) => p.id}
            autoPlayMs={5000}
            renderItem={(publication) => (
              <Link
                to={`/projets-partenariats/publication/${publication.id}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50"
              >
                <h3 className="font-heading text-lg font-medium text-foreground group-hover:text-primary">
                  {publication.titre}
                </h3>
                {publication.description_publique && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {publication.description_publique}
                  </p>
                )}
                {publication.date_publication && (
                  <time className="mt-3 block text-xs text-muted-foreground">
                    {new Date(publication.date_publication).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                )}
              </Link>
            )}
            className="rounded-xl"
          />
        </div>
      )}

      {/* Section etablissements mis en avant */}
      {etablissements.length > 0 && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
            Nos établissements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {etablissements.map((etab) => (
              <Link
                key={etab.id}
                to={`/etablissements`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Building2 size={24} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-medium text-foreground">
                    {etab.nom}
                  </p>
                  {etab.sigle && (
                    <p className="text-xs text-muted-foreground">{etab.sigle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Marquee infini des partenaires (section 7.4 : "marquee infini de logos partenaires") */}
      {partenaires.length > 0 && (
        <div className="py-8">
          <h2 className="mb-6 text-center font-heading text-xl font-semibold text-foreground">
            Nos partenaires
          </h2>
          <InfiniteMarquee
            items={partenaires}
            cleItem={(p) => p.id}
            renderItem={(partenaire) => (
              <div className="flex h-16 items-center rounded-lg border border-border bg-card px-6">
                {partenaire.logo_url ? (
                  <img
                    src={partenaire.logo_url}
                    alt={partenaire.nom}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="font-heading text-sm font-medium text-muted-foreground">
                    {partenaire.nom}
                  </span>
                )}
              </div>
            )}
            itemClassName="mx-5"
          />
        </div>
      )}
    </section>
  )
}
