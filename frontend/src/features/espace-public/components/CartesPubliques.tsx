// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine : projets, partenaires, publications. Les textes de
// repli sont construits a partir des donnees (lib/publique.ts).
import { Link } from "react-router-dom"
import { ArrowRight, CalendarDays, ExternalLink, Globe, Newspaper, Star } from "lucide-react"
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

export function CartePartenaire({ partenaire, className }: { partenaire: PartenairePublic; className?: string }) {
  return (
    <article className={`vt-partner ${className ?? ""}`}>
      <div className="vt-partner-top">
        {partenaire.logo_url ? (
          <img
            src={partenaire.logo_url}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg object-contain ring-1 ring-[var(--color-border)]"
            loading="lazy"
          />
        ) : (
          <span className="vt-mono" aria-hidden="true">{initiales(partenaire.nom)}</span>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="vt-partner-name" style={{ margin: 0 }}>{partenaire.nom}</h3>
          <p className="vt-partner-sub">
            {partenaire.type} · {partenaire.pays}
          </p>
        </div>
        {partenaire.est_strategique && (
          <span className="vt-badge vt-badge-warn" style={{ alignSelf: "flex-start" }}>
            <Star size={11} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />
            Stratégique
          </span>
        )}
      </div>
      <p className="vt-partner-desc">{resumePartenaire(partenaire)}</p>
      {partenaire.site_web && (
        <a
          href={partenaire.site_web}
          target="_blank"
          rel="noreferrer noopener"
          className="vt-meta"
          style={{ color: "var(--color-brand-deep)", fontWeight: 600, textDecoration: "none", marginTop: "auto" }}
        >
          <Globe size={14} aria-hidden="true" /> Site web <ExternalLink size={12} aria-hidden="true" />
          <span className="sr-only">(ouvre un nouvel onglet)</span>
        </a>
      )}
    </article>
  )
}

export function CarteProjet({ projet, className }: { projet: ProjetPublic; className?: string }) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const lienPublication = projet.publication_id ? `/projets-partenariats/publication/${projet.publication_id}` : null

  const contenu = (
    <div className="vt-card-body">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tonStatutProjet(projet.statut)}`}>
          {libelleStatutProjet(projet.statut)}
        </span>
        {projet.etablissement && (
          <span className="vt-muted" style={{ fontSize: 12.5 }}>
            {projet.etablissement.sigle ?? projet.etablissement.nom}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{projet.nom}</h3>
      {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
        <p className="vt-muted" style={{ fontSize: 13 }}>{projet.intitule_officiel}</p>
      )}
      <p className="vt-muted">{resumeProjet(projet)}</p>
      <div className="vt-meta">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CalendarDays size={14} aria-hidden="true" /> {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}
        </span>
      </div>
      {partenairesAffiches.length > 0 && (
        <ul className="vt-tags" aria-label="Partenaires du projet">
          {partenairesAffiches.map((p) => (
            <li key={p.id}>{p.nom}</li>
          ))}
          {reste > 0 && <li className="vt-tag-muted">+{reste}</li>}
        </ul>
      )}
      {lienPublication && (
        <span className="vt-link">
          Lire la publication <ArrowRight size={14} aria-hidden="true" />
        </span>
      )}
    </div>
  )

  return (
    <article className={`vt-card ${className ?? ""}`}>
      {lienPublication ? (
        <Link to={lienPublication} className="vt-card-link">
          {contenu}
        </Link>
      ) : (
        contenu
      )}
    </article>
  )
}

export function CartePublication({ publication, className }: { publication: PublicationPublique; className?: string }) {
  const image = publication.photo_url
  const etablissement = publication.projet.etablissement
  return (
    <article className={`vt-card ${className ?? ""}`} style={{ overflow: "hidden" }}>
      <Link to={`/projets-partenariats/publication/${publication.id}`} className="vt-card-link">
        <div className="vt-pub-cover">
          {image ? (
            <img src={image} alt="" className="vt-art-img" loading="lazy" />
          ) : (
            <span aria-hidden="true" className="vt-pub-placeholder">
              <Newspaper size={36} />
            </span>
          )}
        </div>
        <div className="vt-card-body">
          <p className="vt-muted" style={{ fontSize: 12.5 }}>
            {etablissement ? (etablissement.sigle ?? etablissement.nom) : "Présidence"}
            {publication.date_publication && <> · {formaterDate(publication.date_publication)}</>}
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{publication.titre}</h3>
          <p className="vt-muted">{resumePublication(publication)}</p>
          <span className="vt-link">
            Lire la publication <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
