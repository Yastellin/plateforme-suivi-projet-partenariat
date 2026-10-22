// src/features/espace-public/components/HeroAccueil.tsx
import { Link } from "react-router-dom"
import { Building2, Handshake, Globe, FolderKanban, ArrowRight, Sparkles } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HybridCarousel } from "@/components/shared/HybridCarousel"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { InfiniteMarquee } from "@/components/shared/InfiniteMarquee"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { LogoMedia } from "@/components/shared/ImageMedia"

const elementHero: Variants = {
  cache: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function CompteurVerre({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1">
      {children}
    </div>
  )
}

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
      {/* Hero principal : degrade anime, halos flous et compteurs en verre depoli */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/40">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 -z-10 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-96 w-96 rounded-full bg-[var(--color-brand-moment)]/20 blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="cache"
            animate="visible"
            variants={{
              cache: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
          >
            <motion.span
              variants={elementHero}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3.5 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur"
            >
              <Sparkles size={14} />
              Plateforme officielle de coopération universitaire
            </motion.span>
            <motion.h1
              variants={elementHero}
              className="mt-6 max-w-4xl font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Université de{" "}
              <span className="bg-gradient-to-r from-primary to-[var(--color-brand-deep)] bg-clip-text text-transparent">
                Fianarantsoa
              </span>
            </motion.h1>
            <motion.p
              variants={elementHero}
              className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
            >
              Plateforme centralisée de suivi des projets et partenariats —
              pour une gestion transparente et efficace de la coopération universitaire.
            </motion.p>
            <motion.div
              variants={elementHero}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/25">
                <Link to="/connexion">
                  Espace interne
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6 bg-background/70 backdrop-blur">
                <Link to="/projets-partenariats">Nos projets</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Compteurs animes (section 7.4 : "compteurs animes") */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-6">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </>
            ) : compteurs ? (
              <>
                <CompteurVerre>
                  <AnimatedCounter
                    valeur={compteurs.nombre_etablissements}
                    label="Établissements"
                    icon={Building2}
                  />
                </CompteurVerre>
                <CompteurVerre>
                  <AnimatedCounter
                    valeur={compteurs.nombre_partenaires}
                    label="Partenaires"
                    icon={Handshake}
                  />
                </CompteurVerre>
                <CompteurVerre>
                  <AnimatedCounter
                    valeur={compteurs.nombre_pays_partenaires}
                    label="Pays partenaires"
                    prefixe="+"
                    icon={Globe}
                  />
                </CompteurVerre>
                <CompteurVerre>
                  <AnimatedCounter
                    valeur={compteurs.nombre_projets_actifs}
                    label="Projets actifs"
                    icon={FolderKanban}
                  />
                </CompteurVerre>
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
                <LogoMedia
                  src={partenaire.logo_url}
                  nom={partenaire.nom}
                  className="h-8 w-8 flex-shrink-0 rounded object-contain text-xs"
                  loading="lazy"
                />
                <span className="ml-2 max-w-48 truncate font-heading text-sm font-medium text-muted-foreground">
                  {partenaire.nom}
                </span>
              </div>
            )}
            itemClassName="mx-5"
          />
        </div>
      )}
    </section>
  )
}
