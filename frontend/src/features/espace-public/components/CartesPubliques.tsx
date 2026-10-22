// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine (maquette) : partenaires, projets, publications.
// Les textes de repli viennent de lib/publique.ts et ne contiennent aucune promesse inventee.
import { Link } from "react-router-dom"
import { ArrowRight, CalendarDays, ExternalLink, Globe, Landmark, Star } from "lucide-react"
import { formaterDate } from "@/lib/format"
import type { PartenairePublic, ProjetPublic, PublicationPublique, StatutProjet } from "@/types/api"
import {
  formaterPeriode,
  initiales,
  libelleStatutProjet,
  resumePartenaire,
  resumeProjet,
  resumePublication,
  teinteDe,
} from "@/features/espace-public/lib/publique"
import { Illustration } from "@/features/espace-public/components/Illustrations"
import { resoudreUrlFichier } from "@/lib/url"

function classeBadgeStatut(statut: StatutProjet): string {
  switch (statut) {
    case "EN_COURS":
      return "vt-badge vt-badge-ok"
    case "TERMINE":
      return "vt-badge vt-badge-info"
    case "SUSPENDU":
    case "EXPIRE":
      return "vt-badge vt-badge-err"
    default:
      return "vt-badge"
  }
}

const LIEN_PLEINE_CARTE = { display: "contents", color: "inherit", textDecoration: "none" } as const

export function CartePartenaire({ partenaire, className }: { partenaire: PartenairePublic; className?: string }) {
  return (
    <article className={`vt-pt ${className ?? ""}`}>
      {partenaire.logo_url ? (
        <span className="vt-pt-ini">
          <img src={resoudreUrlFichier(partenaire.logo_url)} alt="" loading="lazy" />
        </span>
      ) : (
        <span className="vt-pt-ini" style={{ background: teinteDe(partenaire.nom) }} aria-hidden="true">
          {initiales(partenaire.nom)}
        </span>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <b>{partenaire.nom}</b>
          {partenaire.est_strategique && (
            <span className="vt-badge vt-badge-warn" style={{ fontSize: 11.5, padding: "1px 8px" }}>
              <Star size={11} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />
              Stratégique
            </span>
          )}
        </div>
        <small>
          {partenaire.type} · {partenaire.pays}
        </small>
        <p className="vt-pt-desc">{resumePartenaire(partenaire)}</p>
        {partenaire.site_web && (
          <a
            href={partenaire.site_web}
            target="_blank"
            rel="noreferrer noopener"
            className="vt-pt-link"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6 }}
          >
            <Globe size={13} aria-hidden="true" /> Site web <ExternalLink size={11} aria-hidden="true" />
            <span className="sr-only">(ouvre un nouvel onglet)</span>
          </a>
        )}
      </div>
    </article>
  )
}

export function CarteProjet({ projet, className }: { projet: ProjetPublic; className?: string }) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const lienPublication = projet.publication_id ? `/projets-partenariats/publication/${projet.publication_id}` : null

  const contenu = (
    <>
      <div className="vt-pub-cover">
        <Illustration type="reseau" />
      </div>
      <div className="vt-pub-body">
        <span className={classeBadgeStatut(projet.statut)}>{libelleStatutProjet(projet.statut)}</span>
        <h3>{projet.nom}</h3>
        {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
          <p className="vt-muted" style={{ fontSize: 13 }}>{projet.intitule_officiel}</p>
        )}
        <p>{resumeProjet(projet)}</p>
        {partenairesAffiches.length > 0 && (
          <ul className="vt-tags" aria-label="Partenaires du projet">
            {partenairesAffiches.map((p) => (
              <li key={p.id}>{p.nom}</li>
            ))}
            {reste > 0 && <li>+{reste}</li>}
          </ul>
        )}
        <div className="vt-meta">
          <span>
            <Landmark aria-hidden="true" />
            {projet.etablissement ? (projet.etablissement.sigle ?? projet.etablissement.nom) : "Présidence"}
          </span>
          <span>
            <CalendarDays aria-hidden="true" />
            {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}
          </span>
        </div>
        {lienPublication && (
          <span className="vt-link">
            Lire la publication <ArrowRight size={14} aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  )

  return (
    <article className={`vt-pub ${className ?? ""}`}>
      {lienPublication ? (
        <Link to={lienPublication} style={LIEN_PLEINE_CARTE}>
          {contenu}
        </Link>
      ) : (
        contenu
      )}
    </article>
  )
}

export function CartePublication({ publication, className }: { publication: PublicationPublique; className?: string }) {
  const etablissement = publication.projet.etablissement
  return (
    <article className={`vt-pub ${className ?? ""}`}>
      <Link to={`/projets-partenariats/publication/${publication.id}`} style={LIEN_PLEINE_CARTE}>
        <div className="vt-pub-cover">
          {publication.photo_url ? (
            <img src={resoudreUrlFichier(publication.photo_url)} alt="" className="vt-art-img" loading="lazy" />
          ) : (
            <Illustration type="montagne" />
          )}
        </div>
        <div className="vt-pub-body">
          <span className="vt-badge vt-badge-info">{etablissement ? (etablissement.sigle ?? etablissement.nom) : "Présidence"}</span>
          <h3>{publication.titre}</h3>
          <p>{resumePublication(publication)}</p>
          <div className="vt-meta">
            <span>
              <Landmark aria-hidden="true" />
              {publication.projet.nom}
            </span>
            {publication.date_publication && (
              <span>
                <CalendarDays aria-hidden="true" />
                {formaterDate(publication.date_publication)}
              </span>
            )}
          </div>
          <span className="vt-link">
            Lire la publication <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
