// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine publique : projets, partenaires, publications.
// Les textes de repli sont construits a partir des donnees disponibles
// (voir lib/publique.ts), jamais de mention generique du type "a venir".
import { Link } from "react-router-dom"
import { ArrowRight, Calendar, ExternalLink, Globe, Newspaper, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formaterDate } from "@/lib/format"
import type { PartenairePublic, ProjetPublic, PublicationPublique } from "@/types/api"
import {
  formaterPeriode,
  initiales,
  libelleStatutProjet,
  resumePartenaire,
  resumeProjet,
  resumePublication,
  tonStatutProjet,
} from "@/features/espace-public/lib/publique"

// Base commune : surelevation et ombre au survol, sans saut de mise en page.
const CARTE_BASE =
  "h-full transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0"

export function CartePartenaire({ partenaire, className }: { partenaire: PartenairePublic; className?: string }) {
  return (
    <Card className={cn(CARTE_BASE, className)}>
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          {partenaire.logo_url ? (
            <img src={partenaire.logo_url} alt="" className="h-12 w-12 rounded-lg object-contain ring-1 ring-border" loading="lazy" />
          ) : (
            <div aria-hidden className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
              {initiales(partenaire.nom)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-heading font-semibold text-foreground">{partenaire.nom}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {partenaire.type} · {partenaire.pays}
            </p>
          </div>
          {partenaire.est_strategique && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
              <Star size={11} aria-hidden /> Stratégique
            </span>
          )}
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {resumePartenaire(partenaire)}
        </p>
        {partenaire.site_web && (
          <a
            href={partenaire.site_web}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Globe size={14} aria-hidden /> Site web <ExternalLink size={12} aria-hidden />
            <span className="sr-only">(ouvre un nouvel onglet)</span>
          </a>
        )}
      </CardContent>
    </Card>
  )
}

export function CarteProjet({ projet, className }: { projet: ProjetPublic; className?: string }) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const lienPublication = projet.publication_id ? `/projets-partenariats/publication/${projet.publication_id}` : null

  const contenu = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tonStatutProjet(projet.statut))}>
          {libelleStatutProjet(projet.statut)}
        </span>
        {projet.etablissement && (
          <span className="truncate text-xs text-muted-foreground">{projet.etablissement.sigle ?? projet.etablissement.nom}</span>
        )}
      </div>
      <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{projet.nom}</h3>
      {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
        <p className="text-xs text-muted-foreground">{projet.intitule_officiel}</p>
      )}
      <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{resumeProjet(projet)}</p>
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={12} aria-hidden /> {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}
        </p>
        {partenairesAffiches.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Partenaires du projet">
            {partenairesAffiches.map((p) => (
              <li key={p.id} className="rounded-full bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                {p.nom}
              </li>
            ))}
            {reste > 0 && <li className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{reste}</li>}
          </ul>
        )}
      </div>
    </>
  )

  return (
    <Card className={cn("group", CARTE_BASE, className)}>
      <CardContent className="flex h-full flex-col gap-3 p-6">
        {lienPublication ? (
          <Link
            to={lienPublication}
            className="flex h-full flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {contenu}
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              Lire la publication <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        ) : (
          contenu
        )}
      </CardContent>
    </Card>
  )
}

export function CartePublication({ publication, className }: { publication: PublicationPublique; className?: string }) {
  const image = publication.photo_url
  const etablissement = publication.projet.etablissement
  return (
    <Card className={cn("group overflow-hidden", CARTE_BASE, className)}>
      <Link
        to={`/projets-partenariats/publication/${publication.id}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 via-accent/30 to-background">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading="lazy"
            />
          ) : (
            <div aria-hidden className="flex h-full w-full items-center justify-center text-primary/40">
              <Newspaper size={40} />
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-5">
          <p className="truncate text-xs text-muted-foreground">
            {etablissement ? (etablissement.sigle ?? etablissement.nom) : "Présidence"}
            {publication.date_publication && <> · {formaterDate(publication.date_publication)}</>}
          </p>
          <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{publication.titre}</h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{resumePublication(publication)}</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary group-hover:underline">
            Lire la publication <ArrowRight size={14} aria-hidden />
          </span>
        </CardContent>
      </Link>
    </Card>
  )
}
