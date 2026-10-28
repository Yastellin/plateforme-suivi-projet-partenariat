// src/features/espace-public/pages/PublicProjetDetailPage.tsx
// Detail d'un projet public : presentation, galerie et actualites liees, informations
// et partenaires associes. Toutes les donnees viennent de l'API publique.
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, Handshake, Landmark } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { formaterDate } from "@/lib/format"
import { usePublicProjetsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { Illustration } from "@/features/espace-public/components/Illustrations"
import { formaterPeriode, libelleStatutProjet, resumeProjet } from "@/features/espace-public/lib/publique"

export function PublicProjetDetailPage() {
  const { id } = useParams()
  const projetsRequete = usePublicProjetsPublies()
  const publicationsRequete = usePublicPublications({ limit: 100 })

  if (projetsRequete.isLoading) {
    return (
      <div className="vt-wrap vt-pad-top">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  const projet = projetsRequete.data?.find((p) => p.id === id)
  if (!projet) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState
          icone={Landmark}
          titre="Projet introuvable"
          description="Ce projet n'est pas publié ou n'existe pas."
          action={
            <Link to="/projets" className="vt-btn vt-btn-ghost">
              <ArrowLeft size={14} aria-hidden="true" /> Retour aux projets
            </Link>
          }
        />
      </div>
    )
  }

  const actualites = (publicationsRequete.data?.data ?? []).filter((p) => p.projet_id === projet.id)
  const publication = actualites[0]
  const galerie = publication?.photos ?? []

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Projets", to: "/projets" }, { libelle: projet.nom }]} />
      </div>

      <section className="vt-wrap vt-detail-head">
        <div className="vt-pub-cover vt-detail-cover">
          {publication?.photo_url ? (
            <img src={publication.photo_url} alt="" className="vt-art-img" decoding="async" />
          ) : (
            <Illustration type="reseau" />
          )}
        </div>
        <div>
          <div className="vt-badges">
            <span className="vt-badge">{libelleStatutProjet(projet.statut)}</span>
            {projet.domaine && <span className="vt-badge vt-badge-info">{projet.domaine}</span>}
          </div>
          <h1>{projet.nom}</h1>
          {projet.intitule_officiel && projet.intitule_officiel !== projet.nom && (
            <p className="vt-muted">{projet.intitule_officiel}</p>
          )}
          <p className="vt-lead">{resumeProjet(projet)}</p>
        </div>
      </section>

      <section className="vt-wrap vt-detail-grid">
        <div className="vt-detail-main">
          <div className="vt-panel">
            <h2>Présentation</h2>
            <p>{projet.description ?? resumeProjet(projet)}</p>
          </div>

          {galerie.length > 0 && (
            <div className="vt-panel">
              <h2>Galerie</h2>
              <div className="vt-galerie">
                {galerie.map((photo) => (
                  <figure key={photo.id}>
                    <img src={photo.url_fichier} alt={photo.legende ?? projet.nom} loading="lazy" decoding="async" />
                    {photo.legende && <figcaption>{photo.legende}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}

          {actualites.length > 0 && (
            <div className="vt-panel">
              <h2>Actualités liées</h2>
              <div className="vt-grid-p">
                {actualites.map((p) => (
                  <CartePublication key={p.id} publication={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="vt-detail-side">
          <div className="vt-panel">
            <h2>Informations</h2>
            <dl className="vt-facts">
              <div>
                <dt>Statut</dt>
                <dd>{libelleStatutProjet(projet.statut)}</dd>
              </div>
              {projet.domaine && (
                <div>
                  <dt>Domaine</dt>
                  <dd>{projet.domaine}</dd>
                </div>
              )}
              <div>
                <dt>Type</dt>
                <dd>{projet.type}</dd>
              </div>
              <div>
                <dt>Établissement porteur</dt>
                <dd>{projet.etablissement?.nom ?? "Présidence"}</dd>
              </div>
              <div>
                <dt>Période</dt>
                <dd>
                  <CalendarDays size={14} aria-hidden="true" />{" "}
                  {formaterPeriode(projet.date_debut, projet.date_fin_prevue)}
                </dd>
              </div>
              {publication?.date_publication && (
                <div>
                  <dt>Publié le</dt>
                  <dd>{formaterDate(publication.date_publication)}</dd>
                </div>
              )}
            </dl>
          </div>

          {projet.partenaires.length > 0 && (
            <div className="vt-panel">
              <h2>
                <Handshake size={18} aria-hidden="true" /> Partenaires associés
              </h2>
              <ul className="vt-list">
                {projet.partenaires.map((p) => (
                  <li key={p.id}>
                    <Link to={`/partenaires/${p.id}`}>{p.nom}</Link>
                    <span className="vt-muted"> · {p.pays}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
