// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine publique : partenaires, projets, publications et variantes de mise en page.
// Les aperçus utilisent uniquement les contenus publics disponibles.
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, ExternalLink, FolderKanban, Globe, Handshake, Landmark, Star } from "lucide-react"
import { formaterDate } from "@/lib/format"
import type { PartenairePublic, ProjetPublic, PublicationPublique, StatutProjet } from "@/types/api"
import type { PartenariatPublic } from "@/features/espace-public/api/usePublicDonneesDetail"
import {
  formaterPeriode,
  initiales,
  type PeriodeCalculeePartenariat,
  libelleStatutProjet,
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

function classeBadgeDomaine(domaine: string): string {
  const valeur = domaine.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
  if (valeur.includes("recherche")) return "vt-badge vt-badge-category vt-domain-recherche"
  if (valeur.includes("formation")) return "vt-badge vt-badge-category vt-domain-formation"
  if (valeur.includes("innovation")) return "vt-badge vt-badge-category vt-domain-innovation"
  return "vt-badge vt-badge-category vt-domain-default"
}

const LIEN_PLEINE_CARTE = { display: "contents", color: "inherit", textDecoration: "none" } as const

interface VarianteCarteProps {
  children: ReactNode
  className?: string
}

// Enveloppes de présentation communes, sans modifier le contenu des cartes.
export function CarteStandard({ children, className = "" }: VarianteCarteProps) {
  return <div className={`vt-card-standard ${className}`}>{children}</div>
}

export function CarteMiseEnAvant({ children, className = "" }: VarianteCarteProps) {
  return <div className={`vt-card-featured ${className}`}>{children}</div>
}

export function CartePartenaire({ partenaire, className }: { partenaire: PartenairePublic; className?: string }) {
  return (
    <article className={`vt-pt h-full ${className ?? ""}`}>
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
        {partenaire.description && <p className="vt-pt-desc">{partenaire.description}</p>}
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

function libellePeriodeCalculee(periode: PeriodeCalculeePartenariat): string {
  switch (periode) {
    case "a-venir": return "À venir"
    case "actif": return "En cours"
    case "termine": return "Terminée"
    default: return "Indéterminée"
  }
}

export function CartePartenariat({
  partenariat,
  className,
  periodeCalculee,
}: {
  partenariat: PartenariatPublic
  className?: string
  periodeCalculee?: PeriodeCalculeePartenariat
}) {
  const libelleDates = partenariat.date_fin
    ? `${formaterDate(partenariat.date_debut)} → ${formaterDate(partenariat.date_fin)}`
    : `Depuis ${formaterDate(partenariat.date_debut)}`
  const logoPartenaire = partenariat.partenaires.find((partenaire) => partenaire.logo_url)
  const periodeCategorie = periodeCalculee ?? "indetermine"
  const periodeTexte = libellePeriodeCalculee(periodeCategorie)

  return (
    <article
      className={`vt-pub h-full ${periodeCalculee ? "vt-card-partenariat" : ""} ${className ?? ""}`}
      data-periode-calcul={periodeCalculee}
    >
      {periodeCalculee && <div className={`vt-card-period-bar vt-card-period-${periodeCategorie}`} aria-hidden="true" />}
      <Link to={`/partenariats/${partenariat.id}`} style={LIEN_PLEINE_CARTE}>
        {periodeCalculee ? (
          <div className="vt-card-top">
            <span className="vt-card-partner-logo">
              {logoPartenaire?.logo_url ? (
                <img src={logoPartenaire.logo_url} alt="" loading="lazy" decoding="async" />
              ) : <Handshake size={26} aria-hidden="true" />}
            </span>
            {partenariat.partenaires.length > 0 && <span className="vt-card-partner-count">{partenariat.partenaires.length} partenaire(s)</span>}
          </div>
        ) : (
          <div className="vt-pub-cover card-img-wrapper">
            <Illustration type="cotutelle" />
          </div>
        )}
        <div className="vt-pub-body vt-card-body">
          <div className="vt-card-tags">
            {periodeCalculee && <span className={`vt-badge-periode vt-badge-periode-${periodeCategorie}`}>Période calculée : {periodeTexte}</span>}
            <span className={classeBadgeDomaine(partenariat.domaine)}>{partenariat.domaine}</span>
          </div>
          <h3>{partenariat.intitule}</h3>
          {partenariat.objet && <p>{partenariat.objet}</p>}
          {partenariat.etablissements.length > 0 && (
            <ul className="vt-tags" aria-label="Établissements associés">
              {partenariat.etablissements.map((etablissement) => (
                <li key={etablissement.id}>{etablissement.sigle ?? etablissement.nom}</li>
              ))}
            </ul>
          )}
          <div className="vt-card-footer">
            <div className="vt-meta">
              <span><CalendarDays aria-hidden="true" />{libelleDates}</span>
              {!periodeCalculee && partenariat.partenaires.length > 0 && (
                <span><Handshake aria-hidden="true" />{partenariat.partenaires.length} partenaire(s)</span>
              )}
            </div>
            <span className="vt-link">Détail <ArrowRight size={14} aria-hidden="true" /></span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function CartePartenariatTimeline({ partenariat, className }: { partenariat: PartenariatPublic; className?: string }) {
  return <CartePartenariat partenariat={partenariat} className={`vt-timeline-card ${className ?? ""}`} />
}

export function CarteProjet({ projet, className, lien }: { projet: ProjetPublic; className?: string; lien?: string }) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const lienDestination = lien ?? `/projets/${projet.id}`

  const contenu = (
    <>
      <div className="vt-pub-cover card-img-wrapper">
        <Illustration type="reseau" />
      </div>
      <div className="vt-pub-body">
        <span className={classeBadgeStatut(projet.statut)}>{libelleStatutProjet(projet.statut)}</span>
        <h3>{projet.nom}</h3>
        {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
          <p className="vt-muted" style={{ fontSize: 13 }}>{projet.intitule_officiel}</p>
        )}
        {projet.description && <p>{projet.description}</p>}
        {partenairesAffiches.length > 0 && (
          <ul className="vt-tags" aria-label="Partenaires du projet">
            {partenairesAffiches.map((p) => (
              <li key={p.id}>{p.nom}</li>
            ))}
            {reste > 0 && <li>+{reste}</li>}
          </ul>
        )}
        <div className="vt-card-footer">
          <div className="vt-meta">
            {projet.etablissement && (
              <span>
                <Landmark aria-hidden="true" />
                {projet.etablissement.sigle ?? projet.etablissement.nom}
              </span>
            )}
            <span>
              <CalendarDays aria-hidden="true" />
              {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}
            </span>
          </div>
          <span className="vt-link">
            Détail <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </>
  )

  return (
    <article className={`vt-pub h-full ${className ?? ""}`}>
      <Link to={lienDestination} style={LIEN_PLEINE_CARTE}>
        {contenu}
      </Link>
    </article>
  )
}

export function CarteProjetDashboard({
  projet,
  className,
  lien,
}: {
  projet: ProjetPublic
  className?: string
  lien?: string
}) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length

  return (
    <article className={`vt-project-card vt-project-status-${projet.statut} ${className ?? ""}`} data-statut={projet.statut}>
      <Link to={lien ?? `/projets/${projet.id}`} className="vt-project-card-link">
        <header className="vt-project-card-header">
          <span className="vt-project-icon"><FolderKanban size={25} aria-hidden="true" /></span>
          <span className={classeBadgeStatut(projet.statut)}>{libelleStatutProjet(projet.statut)}</span>
        </header>
        <div className="vt-project-image" aria-hidden="true"><Illustration type="reseau" /></div>
        <div className="vt-project-content">
          {projet.domaine && <span className={classeBadgeDomaine(projet.domaine)}>{projet.domaine}</span>}
          <h3>{projet.nom}</h3>
          {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && <p className="vt-project-official-title">{projet.intitule_officiel}</p>}
          {projet.description && <p className="vt-project-description">{projet.description}</p>}
          {partenairesAffiches.length > 0 && (
            <ul className="vt-project-partners" aria-label="Partenaires du projet">
              {partenairesAffiches.map((partenaire) => <li key={partenaire.id}>{partenaire.nom}</li>)}
              {reste > 0 && <li>+{reste}</li>}
            </ul>
          )}
          {projet.etablissement && <p className="vt-project-establishment"><Landmark size={14} aria-hidden="true" /> {projet.etablissement.sigle ?? projet.etablissement.nom}</p>}
          <footer className="vt-project-footer">
            <span><CalendarDays size={14} aria-hidden="true" /> Période : {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}</span>
            <span className="vt-link">Détails <ArrowRight size={14} aria-hidden="true" /></span>
          </footer>
        </div>
      </Link>
    </article>
  )
}

export function CartePublication({ publication, className, lien }: { publication: PublicationPublique; className?: string; lien?: string }) {
  const estMagazine = className?.split(/\s+/).includes("vt-news-list-item") ?? false
  const imagePrincipale = imagePrincipalePublication(publication)
  const photoIllustrative = [...publication.photos].sort((a, b) => a.ordre - b.ordre)[0]
  const texteAlternatif = publication.image_couverture_url
    ? publication.titre
    : photoIllustrative?.legende || publication.titre

  return (
    <article className={`vt-pub h-full ${className ?? ""}`}>
      <Link to={lien ?? `/actualites/${publication.id}`} style={LIEN_PLEINE_CARTE}>
        <div className="vt-pub-cover card-img-wrapper">
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
        <div className={`vt-pub-body${estMagazine ? " vt-news-list-content" : ""}`}>
          <span className="vt-badge vt-badge-publication">Actualité</span>
          <h3>{publication.titre}</h3>
          {publication.description_publique && <p>{publication.description_publique}</p>}
          <div className="vt-card-footer">
            <div className={`vt-meta${estMagazine ? " vt-news-meta" : ""}`}>
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
        </div>
      </Link>
    </article>
  )
}
