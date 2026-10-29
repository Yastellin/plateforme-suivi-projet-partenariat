import { Link, useParams } from "react-router-dom"
import { Handshake, Landmark } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicProjetsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { BadgeCategorie } from "@/features/espace-public/components/BadgeCategorie"
import { CarteLaterale } from "@/features/espace-public/components/CarteLaterale"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { DetailLayout } from "@/features/espace-public/components/DetailLayout"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { Illustration } from "@/features/espace-public/components/Illustrations"
import { PartageSocial } from "@/features/espace-public/components/PartageSocial"
import { PageIntrouvable } from "@/features/espace-public/components/PageIntrouvable"

export function PublicProjetDetailPage() {
  const { id } = useParams()
  const projetsRequete = usePublicProjetsPublies()
  const publicationsRequete = usePublicPublications({ limit: 100 })

  if (projetsRequete.isLoading) {
    return <div className="vt-wrap vt-section" aria-busy="true"><Skeleton className="h-96 rounded-2xl" /></div>
  }
  if (projetsRequete.isError) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState icone={Landmark} titre="Le projet n'a pas pu être chargé" description="Vérifiez votre connexion puis réessayez." action={<button type="button" className="vt-btn vt-btn-ghost" onClick={() => projetsRequete.refetch()}>Réessayer</button>} />
      </div>
    )
  }

  const projet = projetsRequete.data?.find((item) => item.id === id)
  if (!projet) {
    return <PageIntrouvable titre="Projet introuvable" description="Ce projet n'existe pas ou a été retiré." />
  }

  const actualites = (publicationsRequete.data?.data ?? [])
    .filter((publication) => publication.projet_id === projet.id)
    .sort((a, b) => (b.date_publication ?? "").localeCompare(a.date_publication ?? ""))
  const photos = actualites.flatMap((publication) => publication.photos ?? [])
    .sort((a, b) => a.ordre - b.ordre)
  const actualiteCouverture = actualites.find((publication) => publication.image_couverture_url || publication.photo_url)

  return (
    <div className="vt-detail-page">
      <div className="vt-wrap vt-detail-breadcrumb">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Projets", to: "/projets" }, { libelle: projet.nom }]} />
      </div>
      <header className="vt-wrap vt-detail-hero vt-detail-hero-projet">
        <div className="vt-detail-hero-image">
          {actualiteCouverture?.image_couverture_url || actualiteCouverture?.photo_url ? (
            <img src={actualiteCouverture.image_couverture_url ?? actualiteCouverture.photo_url ?? ""} alt="" fetchPriority="high" decoding="async" />
          ) : <Illustration type="reseau" />}
        </div>
        <div className="vt-detail-hero-content">
          <span className="vt-surtitre">Projet</span>
          {projet.domaine && <div className="vt-detail-meta"><BadgeCategorie variante="innovation">{projet.domaine}</BadgeCategorie></div>}
          <h1>{projet.nom}</h1>
          {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && <p className="vt-detail-intro">{projet.intitule_officiel}</p>}
        </div>
      </header>

      <DetailLayout
        className="vt-detail-projet-layout"
        labelSidebar="Informations sur le projet"
        sidebar={(
          <>
            <CarteLaterale titre="Informations clés" variante="information" icone={Landmark}>
              <dl className="vt-detail-facts">
                {projet.domaine && <div><dt>Domaine</dt><dd>{projet.domaine}</dd></div>}
                {projet.etablissement && <div><dt>Établissement porteur</dt><dd>{projet.etablissement.nom}</dd></div>}
              </dl>
            </CarteLaterale>
            {projet.partenaires.length > 0 && (
              <CarteLaterale titre="Partenaires associés" icone={Handshake}>
                <ul className="vt-detail-link-list">
                  {projet.partenaires.map((partenaire) => <li key={partenaire.id}><Link to={`/partenaires/${partenaire.id}`}>{partenaire.nom}</Link><span>{partenaire.pays}</span></li>)}
                </ul>
              </CarteLaterale>
            )}
            <PartageSocial />
          </>
        )}
      >
        {projet.description && <section className="vt-detail-section"><h2>Présentation</h2><p className="vt-detail-prose">{projet.description}</p></section>}
        {photos.length > 0 && (
          <section className="vt-detail-section">
            <h2>Galerie photos</h2>
            <div className="vt-detail-galerie">
              {photos.map((photo) => <figure key={photo.id}><img className="vt-detail-gallery-image" src={photo.url_fichier} alt={photo.legende || projet.nom} loading="lazy" decoding="async" />{photo.legende && <figcaption>{photo.legende}</figcaption>}</figure>)}
            </div>
          </section>
        )}
        {actualites.length > 0 && (
          <section className="vt-detail-section">
            <h2>Actualités liées</h2>
            <div className="vt-detail-actualites">{actualites.map((publication) => <CartePublication key={publication.id} publication={publication} />)}</div>
          </section>
        )}
        {!projet.description && photos.length === 0 && actualites.length === 0 && <section className="vt-detail-section"><p className="vt-muted">Aucun contenu complémentaire n'est publié pour ce projet.</p></section>}
      </DetailLayout>
    </div>
  )
}
