// src/features/espace-public/components/CartesPubliques.tsx
// Cartes de la vitrine publique : partenaires, projets, publications et variantes de mise en page.
// Les aperçus utilisent uniquement les contenus publics disponibles.
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, ExternalLink, Globe, Landmark } from "lucide-react"
import type { PartenairePublic, ProjetPublic, PublicationPublique } from "@/types/api"
import type { PartenariatPublic } from "@/features/espace-public/api/usePublicDonneesDetail"
import { imagePrincipalePublication } from "@/features/espace-public/lib/publique"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"

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
        <span className="vt-pt-ini">
          <ImageDefaut alt="" className="vt-image-defaut" />
        </span>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <b>
            <Link to={`/partenaires/${partenaire.id}`} className="vt-stretch">
              {partenaire.nom}
            </Link>
          </b>
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

export function CartePartenariat({
  partenariat,
  className,
}: {
  partenariat: PartenariatPublic
  className?: string
}) {
  const logoPartenaire = partenariat.partenaires.find((partenaire) => partenaire.logo_url)

  return (
    <article className={`vt-pub h-full ${className ?? ""}`}>
      <Link to={`/partenariats/${partenariat.id}`} style={LIEN_PLEINE_CARTE}>
        <div className="vt-card-top">
          <span className="vt-card-partner-logo">
            {logoPartenaire?.logo_url ? (
              <img src={logoPartenaire.logo_url} alt="" loading="lazy" decoding="async" />
            ) : <ImageDefaut alt="" className="vt-image-defaut" />}
          </span>
          {partenariat.partenaires.length > 0 && <span className="vt-card-partner-count">{partenariat.partenaires.length} partenaire(s)</span>}
        </div>
        <div className="vt-pub-body vt-card-body">
          <div className="vt-card-tags">
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
        <ImageDefaut alt="" className="vt-art-img vt-image-defaut" />
      </div>
      <div className="vt-pub-body">
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

function classeTagDomaine(domaine: string): string {
  const valeur = domaine.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
  if (valeur.includes("recherche")) return "vt-time-tag vt-time-tag-recherche"
  if (valeur.includes("formation")) return "vt-time-tag vt-time-tag-formation"
  if (valeur.includes("infrastructure")) return "vt-time-tag vt-time-tag-infrastructure"
  return "vt-time-tag vt-time-tag-default"
}

function libellerDomaineTimeCard(domaine: string): string {
  const valeur = domaine.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
  if (valeur.includes("recherche")) return "Recherche"
  if (valeur.includes("formation")) return "Formation"
  if (valeur.includes("innovation")) return "Innovation"
  if (valeur.includes("infrastructure")) return "Infrastructure"
  return domaine.replaceAll("_", " ")
}

export function CarteProjetTimeCard({
  projet,
  className,
  lien,
  variante = "accueil",
}: {
  projet: ProjetPublic
  className?: string
  lien?: string
  variante?: "accueil" | "liste"
}) {
  const partenairesAffiches = projet.partenaires.slice(0, 3)
  const reste = projet.partenaires.length - partenairesAffiches.length
  const varianteCSS = variante === "accueil" ? "home" : "list"

  return (
    <Link
      to={lien ?? `/projets/${projet.id}`}
      className={`vt-time-card vt-time-card-${varianteCSS} ${className ?? ""}`}
    >
      <div className="vt-time-main">
        <div className="vt-time-content">
          {projet.domaine && (
            <div className="vt-time-tags">
              <span className={classeTagDomaine(projet.domaine)}>{libellerDomaineTimeCard(projet.domaine)}</span>
            </div>
          )}
          <h3>{projet.nom}</h3>
          {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
            <p className="vt-time-official-title">{projet.intitule_officiel}</p>
          )}
          {projet.description && <p className="vt-time-description">{projet.description}</p>}
          {partenairesAffiches.length > 0 && (
            <ul className="vt-time-partners" aria-label="Partenaires du projet">
              {partenairesAffiches.map((partenaire) => <li key={partenaire.id}>{partenaire.nom}</li>)}
              {reste > 0 && <li>+{reste}</li>}
            </ul>
          )}
          <div className="vt-time-meta">
            {projet.etablissement && (
              <span><Landmark aria-hidden="true" />{projet.etablissement.sigle ?? projet.etablissement.nom}</span>
            )}
          </div>
        </div>
        {variante === "liste" && <span className="vt-card-action" aria-hidden="true"><ArrowRight size={20} /></span>}
      </div>
    </Link>
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
            <ImageDefaut alt="" className="vt-art-img vt-image-defaut" />
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
                  {new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(new Date(`${publication.date_publication.slice(0, 10)}T12:00:00`))}
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
