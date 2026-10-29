import { Link, useParams } from "react-router-dom"
import { ExternalLink, Globe, Handshake } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicProjetsPublies, usePublicPartenariatsPublies, usePublicTousPartenaires } from "@/features/espace-public/api/usePublicDonneesDetail"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { BadgeCategorie } from "@/features/espace-public/components/BadgeCategorie"
import { CarteLaterale } from "@/features/espace-public/components/CarteLaterale"
import { CarteProjet, CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { DetailLayout } from "@/features/espace-public/components/DetailLayout"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PartageSocial } from "@/features/espace-public/components/PartageSocial"
import { PageIntrouvable } from "@/features/espace-public/components/PageIntrouvable"

export function PublicPartenaireDetailPage() {
  const { id } = useParams()
  const partenairesRequete = usePublicTousPartenaires()
  const projetsRequete = usePublicProjetsPublies()
  const partenariatsRequete = usePublicPartenariatsPublies()
  const publicationsRequete = usePublicPublications({ limit: 100 })

  if (partenairesRequete.isLoading) {
    return <div className="vt-wrap vt-section" aria-busy="true"><Skeleton className="h-64 rounded-2xl" /></div>
  }
  if (partenairesRequete.isError) {
    return <div className="vt-wrap vt-section"><EmptyState titre="Le partenaire n'a pas pu être chargé" description="Vérifiez votre connexion puis réessayez." action={<button type="button" className="vt-btn vt-btn-ghost" onClick={() => partenairesRequete.refetch()}>Réessayer</button>} /></div>
  }

  const partenaire = partenairesRequete.data?.find((item) => item.id === id)
  if (!partenaire) {
    return <PageIntrouvable titre="Partenaire introuvable" description="Ce partenaire n'existe pas ou a été retiré." />
  }

  const projets = (projetsRequete.data ?? []).filter((projet) => projet.partenaires.some((item) => item.id === partenaire.id))
  const idsProjets = new Set(projets.map((projet) => projet.id))
  const actualites = (publicationsRequete.data?.data ?? [])
    .filter((publication) => idsProjets.has(publication.projet_id))
    .sort((a, b) => (b.date_publication ?? "").localeCompare(a.date_publication ?? ""))
  const partenariats = (partenariatsRequete.data ?? []).filter((item) => item.partenaires.some((relation) => relation.id === partenaire.id))
  const domaines = [...new Set(partenariats.map((item) => item.domaine).filter(Boolean))]

  return (
    <div className="vt-detail-page">
      <div className="vt-wrap vt-detail-breadcrumb">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenaires", to: "/partenaires" }, { libelle: partenaire.nom }]} />
      </div>
      <header className="vt-wrap vt-detail-hero vt-detail-hero-partenaire">
        <div className="vt-detail-partner-logo">
          {partenaire.logo_url && <img src={partenaire.logo_url} alt={`Logo de ${partenaire.nom}`} fetchPriority="high" decoding="async" />}
        </div>
        <div className="vt-detail-hero-content">
          <span className="vt-surtitre">Partenaire</span>
          <div className="vt-detail-meta">
            <BadgeCategorie>{partenaire.type}</BadgeCategorie>
            <BadgeCategorie>{partenaire.pays}</BadgeCategorie>
          </div>
          <h1>{partenaire.nom}</h1>
        </div>
      </header>

      <DetailLayout
        className="vt-detail-partenaire-layout"
        labelSidebar="Informations publiques sur le partenaire"
        sidebar={(
          <>
            <CarteLaterale titre="Informations publiques" variante="information" icone={Globe}>
              <dl className="vt-detail-facts">
                <div><dt>Pays</dt><dd>{partenaire.pays}</dd></div>
                <div><dt>Type</dt><dd>{partenaire.type}</dd></div>
                <div><dt>Projets associés</dt><dd>{projets.length}</dd></div>
                <div><dt>Partenariats associés</dt><dd>{partenariats.length}</dd></div>
                {partenaire.site_web && <div><dt>Site web</dt><dd><a className="vt-external-link" href={partenaire.site_web} target="_blank" rel="noreferrer noopener"><Globe size={14} aria-hidden="true" /> Visiter le site <ExternalLink size={12} aria-hidden="true" /></a></dd></div>}
              </dl>
            </CarteLaterale>
            <PartageSocial />
          </>
        )}
      >
        {partenaire.description && <section className="vt-detail-section"><h2>À propos</h2><p className="vt-detail-prose">{partenaire.description}</p></section>}
        {domaines.length > 0 && (
          <section className="vt-detail-section">
            <h2>Domaines de coopération</h2>
            <div className="vt-detail-domaines">{domaines.map((domaine) => <BadgeCategorie variante="innovation" key={domaine}>{domaine}</BadgeCategorie>)}</div>
            <ul className="vt-detail-link-list vt-detail-partenariats">{partenariats.map((partenariat) => <li key={partenariat.id}><Link to={`/partenariats/${partenariat.id}`}>{partenariat.intitule}</Link><span>{partenariat.domaine}</span></li>)}</ul>
          </section>
        )}
        <section className="vt-detail-section">
          <h2><Handshake size={20} aria-hidden="true" /> Projets associés</h2>
          {projets.length === 0 ? <p className="vt-muted">Aucun projet publié n'est associé à ce partenaire.</p> : <div className="vt-detail-actualites">{projets.map((projet) => <CarteProjet key={projet.id} projet={projet} lien={`/projets/${projet.id}`} />)}</div>}
        </section>
        {actualites.length > 0 && (
          <section className="vt-detail-section">
            <h2>Actualités liées</h2>
            <div className="vt-detail-actualites">{actualites.map((publication) => <CartePublication key={publication.id} publication={publication} />)}</div>
          </section>
        )}
        {!partenaire.description && domaines.length === 0 && projets.length === 0 && actualites.length === 0 && <section className="vt-detail-section"><p className="vt-muted">Aucune information complémentaire n'est publiée pour ce partenaire.</p></section>}
      </DetailLayout>
    </div>
  )
}
