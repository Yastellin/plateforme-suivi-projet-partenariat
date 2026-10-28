// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine (maquette) : partenaires, projets, publications.
// Les textes de repli viennent de lib/publique.ts et ne contiennent aucune promesse inventee.
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, ExternalLink, Globe, Handshake, Landmark, Star } from "lucide-react"
import { formaterDate } from "@/lib/format"
import type { PartenairePublic, ProjetPublic, PublicationPublique, StatutProjet } from "@/types/api"
import type { PartenariatPublic } from "@/features/espace-public/api/usePublicDonneesDetail"
import {
  formaterPeriode,
  initiales,
  libelleStatutProjet,
  resumePartenaire,
  resumeProjet,
  resumePublication,
  imagePrincipalePublication,
  teinteDe,
} from "@/features/espace-public/lib/publique"
import { Illustration } from "@/features/espace-public/components/Illustrations"

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
          <img src={partenaire.logo_url} alt="" loading="lazy" decoding="async" />
        </span>
      ) : (
        <span className="vt-pt-ini" style={{ background: teinteDe(partenaire.nom) }} aria-hidden="true">
          {initiales(partenaire.nom)}
        </span>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <b>
            <Link to={`/partenaires/${partenaire.id}`} className="vt-stretch">
              {partenaire.nom}
            </Link>
          </b>
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

export function CartePartenariat({ partenariat, className }: { partenariat: PartenariatPublic; className?: string }) {
  const periode = partenariat.date_fin
    ? `${formaterDate(partenariat.date_debut)} → ${formaterDate(partenariat.date_fin)}`
    : `Depuis ${formaterDate(partenariat.date_debut)}`

  return (
    <article className={`vt-pub ${className ?? ""}`}>
      <Link to={`/partenariats/${partenariat.id}`} style={LIEN_PLEINE_CARTE}>
        <div className="vt-pub-cover">
          <Illustration type="cotutelle" />
        </div>
        <div className="vt-pub-body">
          <span className="vt-badge vt-badge-info">{partenariat.domaine}</span>
          <h3>{partenariat.intitule}</h3>
          {partenariat.objet && <p>{partenariat.objet}</p>}
          {partenariat.etablissements.length > 0 && (
            <ul className="vt-tags" aria-label="Établissements associés">
              {partenariat.etablissements.map((etablissement) => (
                <li key={etablissement.id}>{etablissement.sigle ?? etablissement.nom}</li>
              ))}
            </ul>
          )}
          <div className="vt-meta">
            <span><CalendarDays aria-hidden="true" />{periode}</span>
            {partenariat.partenaires.length > 0 && (
              <span><Handshake aria-hidden="true" />{partenariat.partenaires.length} partenaire(s)</span>
            )}
          </div>
          <span className="vt-link">Détail <ArrowRight size={14} aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  )
}

export function CarteProjet({ projet, className, lien }: { projet: ProjetPublic; className?: string; lien?: string }) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const lienPublication = lien ?? (projet.publication_id ? `/actualites/${projet.publication_id}` : null)

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
            {lien ? "Détail" : "Lire la publication"} <ArrowRight size={14} aria-hidden="true" />
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

export function CartePublication({ publication, className, lien }: { publication: PublicationPublique; className?: string; lien?: string }) {
  const imagePrincipale = imagePrincipalePublication(publication)
  const photoIllustrative = [...publication.photos].sort((a, b) => a.ordre - b.ordre)[0]
  const texteAlternatif = publication.image_couverture_url
    ? publication.titre
    : photoIllustrative?.legende || publication.titre

  return (
    <article className={`vt-pub ${className ?? ""}`}>
      <Link to={lien ?? `/actualites/${publication.id}`} style={LIEN_PLEINE_CARTE}>
        <div className="vt-pub-cover">
          {imagePrincipale ? (
            <motion.img
              layoutId={`cover-${publication.id}`}
              src={imagePrincipale}
              alt={texteAlternatif}
              className="vt-art-img"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div role="img" aria-label={`Illustration neutre de ${publication.titre}`}>
              <Illustration type="montagne" />
            </div>
          )}
        </div>
        <div className="vt-pub-body">
          <span className="vt-badge vt-badge-info">Actualité</span>
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
            Détail <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
