// src/features/espace-public/components/HeroAccueil.tsx
import { Link } from "react-router-dom"
import { Building2, Handshake, Globe, FolderKanban, ArrowRight, Sparkles, Newspaper } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"

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

// Hero de la page d'accueil : presentation de l'Universite et compteurs
// animes. Chaque compteur est un decompte reel de la base de donnees
// (endpoint /public/accueil).
export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()
  const compteurs = data?.compteurs

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/40">
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
          <motion.p variants={elementHero} className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Projets, partenariats et résultats de recherche de l'Université, réunis sur une même plateforme
            pour une coopération transparente.
          </motion.p>
          <motion.div variants={elementHero} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/25">
              <Link to="/projets-partenariats">
                Projets & partenaires
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-background/70 px-6 backdrop-blur">
              <Link to="/projets-partenariats?onglet=publications">
                <Newspaper size={16} />
                Dernières publications
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Compteurs animes : decomptes reels de la base de donnees */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-6">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))
          ) : compteurs ? (
            <>
              <CompteurVerre>
                <AnimatedCounter valeur={compteurs.nombre_etablissements} label="Établissements" icon={Building2} />
              </CompteurVerre>
              <CompteurVerre>
                <AnimatedCounter valeur={compteurs.nombre_partenaires} label="Partenaires actifs" icon={Handshake} />
              </CompteurVerre>
              <CompteurVerre>
                <AnimatedCounter valeur={compteurs.nombre_pays_partenaires} label="Pays partenaires" icon={Globe} />
              </CompteurVerre>
              <CompteurVerre>
                <AnimatedCounter valeur={compteurs.nombre_projets_actifs} label="Projets actifs" icon={FolderKanban} />
              </CompteurVerre>
              <CompteurVerre>
                <AnimatedCounter valeur={compteurs.nombre_publications} label="Publications" icon={Newspaper} />
              </CompteurVerre>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
