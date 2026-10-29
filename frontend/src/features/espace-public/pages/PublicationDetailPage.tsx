import { Link, useParams } from "react-router-dom"
import { isAxiosError } from "axios"
import { ArrowLeft, CalendarDays, Landmark, Newspaper } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { ImageMedia } from "@/components/shared/ImageMedia"
import { SkeletonPage } from "@/components/shared/SkeletonPage"
import { formaterDate } from "@/lib/format"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"
import { usePublicPublicationDetail } from "@/features/espace-public/api/usePublicPublications"
import { BadgeCategorie } from "@/features/espace-public/components/BadgeCategorie"
import { CarteLaterale } from "@/features/espace-public/components/CarteLaterale"
import { DetailLayout } from "@/features/espace-public/components/DetailLayout"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { Illustration } from "@/features/espace-public/components/Illustrations"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"
import { PartageSocial } from "@/features/espace-public/components/PartageSocial"

export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const requete = usePublicPublicationDetail(id)
  const publication = requete.data
  useTitreBreadcrumb(publication?.titre)

  if (requete.isLoading) {
    return <SkeletonPage cartes={0} avecHero label="Chargement de l'actualité" />
  }

  const erreur404 = requete.isError && isAxiosError(requete.error) && requete.error.response?.status === 404
  if (requete.isError && !erreur404) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState
          icone={Newspaper}
          titre="L'actualité n'a pas pu être chargée"
          description="Vérifiez votre connexion puis réessayez."
          action={<Link to="/actualites" className="vt-btn vt-btn-ghost"><ArrowLeft size={14} aria-hidden="true" /> Retour aux actualités</Link>}
        />
      </div>
    )
  }
  if (!publication) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyStateSection
          icone={<Newspaper aria-hidden="true" />}
          titre="Actualité introuvable"
          description="Cet élément n'existe pas ou a été retiré."
        />
      </div>
    )
  }

  const photos = [...(publication.photos ?? [])].sort((a, b) => a.ordre - b.ordre)

  return (
    <div className="vt-detail-page">
      <div className="vt-wrap vt-detail-breadcrumb">
        <FilAriane etapes={[
          { libelle: "Accueil", to: "/" },
          { libelle: "Actualités", to: "/actualites" },
          { libelle: publication.titre },
        ]} />
      </div>

      <header className="vt-wrap vt-detail-hero vt-detail-hero-actualite">
        <div className="vt-detail-hero-image">
          {publication.image_couverture_url ? (
            <img src={publication.image_couverture_url} alt="" fetchPriority="high" decoding="async" />
          ) : (
            <Illustration type="montagne" />
          )}
        </div>
        <div className="vt-detail-hero-content">
          <span className="vt-surtitre">Actualité</span>
          <h1>{publication.titre}</h1>
          <div className="vt-detail-meta">
            {publication.projet.etablissement && (
              <BadgeCategorie>{publication.projet.etablissement.sigle ?? publication.projet.etablissement.nom}</BadgeCategorie>
            )}
            {publication.date_publication && (
              <span><CalendarDays size={15} aria-hidden="true" /> Publié le {formaterDate(publication.date_publication)}</span>
            )}
          </div>
        </div>
      </header>

      <DetailLayout
        className="vt-detail-actualite-layout"
        labelSidebar="À propos de cette actualité"
        sidebar={(
          <>
            <CarteLaterale titre="Projet associé" variante="information" icone={Landmark}>
              <Link className="vt-card-link" to={`/projets/${publication.projet.id}`}>
                <span>{publication.projet.nom}</span>
                <span aria-hidden="true">→</span>
              </Link>
              {publication.projet.etablissement && <p className="vt-muted">{publication.projet.etablissement.nom}</p>}
            </CarteLaterale>
            <PartageSocial />
          </>
        )}
      >
        {publication.description_publique && (
          <section className="vt-detail-section">
            <h2>Description</h2>
            <p className="vt-detail-prose">{publication.description_publique}</p>
          </section>
        )}
        {publication.resultats && (
          <section className="vt-detail-section">
            <h2>Résultats obtenus</h2>
            <p className="vt-detail-prose">{publication.resultats}</p>
          </section>
        )}
        {photos.length > 0 && (
          <section className="vt-detail-section">
            <h2>Galerie photos</h2>
            <div className="vt-detail-galerie">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <ImageMedia src={photo.url_fichier} alt={photo.legende || publication.titre} className="vt-detail-gallery-image" />
                  {photo.legende && <figcaption>{photo.legende}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
        {!publication.description_publique && !publication.resultats && photos.length === 0 && (
          <section className="vt-detail-section"><p className="vt-muted">Aucun contenu complémentaire n'est publié pour cette actualité.</p></section>
        )}
      </DetailLayout>
    </div>
  )
}
