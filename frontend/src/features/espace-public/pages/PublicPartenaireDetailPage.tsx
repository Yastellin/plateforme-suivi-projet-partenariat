// src/features/espace-public/pages/PublicPartenaireDetailPage.tsx
// Detail d'un partenaire public : presentation, domaines de cooperation, projets et
// actualites lies, informations publiques. Aucune date de convention ni document interne.
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ExternalLink, Globe, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { usePublicProjetsPublies, usePublicPartenariatsPublies, usePublicTousPartenaires } from "@/features/espace-public/api/usePublicDonneesDetail"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { CartePublication, CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { initiales, resumePartenaire, teinteDe } from "@/features/espace-public/lib/publique"

export function PublicPartenaireDetailPage() {
  const { id } = useParams()
  const partenairesRequete = usePublicTousPartenaires()
  const projetsRequete = usePublicProjetsPublies()
  const partenariatsRequete = usePublicPartenariatsPublies()
  const publicationsRequete = usePublicPublications({ limit: 100 })

  if (partenairesRequete.isLoading) {
    return (
      <div className="vt-wrap vt-pad-top">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const partenaire = partenairesRequete.data?.find((p) => p.id === id)
  if (!partenaire) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState
          titre="Partenaire introuvable"
          description="Ce partenaire n'est pas visible publiquement ou n'existe pas."
          action={
            <Link to="/partenariats" className="vt-btn vt-btn-ghost">
              <ArrowLeft size={14} aria-hidden="true" /> Retour aux partenariats
            </Link>
          }
        />
      </div>
    )
  }

  const projets = (projetsRequete.data ?? []).filter((p) => p.partenaires.some((x) => x.id === partenaire.id))
  const idsProjets = new Set(projets.map((p) => p.id))
  const actualites = (publicationsRequete.data?.data ?? []).filter((p) => idsProjets.has(p.projet_id))
  const domaines = [
    ...new Set(
      (partenariatsRequete.data ?? [])
        .filter((pt) => pt.partenaires.some((x) => x.id === partenaire.id))
        .map((pt) => pt.domaine)
        .filter(Boolean),
    ),
  ]

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane
          etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenariats", to: "/partenariats" }, { libelle: partenaire.nom }]}
        />
      </div>

      <section className="vt-wrap vt-detail-head vt-detail-head-carte">
        <div className="vt-detail-logo">
          {partenaire.logo_url ? (
            <img src={partenaire.logo_url} alt={`Logo de ${partenaire.nom}`} decoding="async" />
          ) : (
            <span style={{ background: teinteDe(partenaire.nom) }} aria-hidden="true">
              {initiales(partenaire.nom)}
            </span>
          )}
        </div>
        <div>
          <div className="vt-badges">
            <span className="vt-badge vt-badge-info">{partenaire.type}</span>
            <span className="vt-badge">{partenaire.pays}</span>
            {partenaire.est_strategique && (
              <span className="vt-badge vt-badge-warn">
                <Star size={11} aria-hidden="true" /> Stratégique
              </span>
            )}
          </div>
          <h1>{partenaire.nom}</h1>
          <p className="vt-lead">{resumePartenaire(partenaire)}</p>
        </div>
      </section>

      <section className="vt-wrap vt-detail-grid">
        <div className="vt-detail-main">
          <div className="vt-panel">
            <h2>À propos</h2>
            <p>{partenaire.description ?? resumePartenaire(partenaire)}</p>
          </div>

          {domaines.length > 0 && (
            <div className="vt-panel">
              <h2>Domaines de coopération</h2>
              <ul className="vt-tags">
                {domaines.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="vt-panel">
            <h2>Projets liés</h2>
            {projets.length === 0 ? (
              <p className="vt-muted">Aucun projet publié n'est lié à ce partenaire pour le moment.</p>
            ) : (
              <div className="vt-grid-p">
                {projets.map((projet) => (
                  <CarteProjet key={projet.id} projet={projet} lien={`/projets/${projet.id}`} />
                ))}
              </div>
            )}
          </div>

          {actualites.length > 0 && (
            <div className="vt-panel">
              <h2>Actualités liées</h2>
              <div className="vt-grid-p">
                {actualites.map((publication) => (
                  <CartePublication key={publication.id} publication={publication} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="vt-detail-side">
          <div className="vt-panel">
            <h2>Informations publiques</h2>
            <dl className="vt-facts">
              <div>
                <dt>Pays</dt>
                <dd>{partenaire.pays}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{partenaire.type}</dd>
              </div>
              {partenaire.site_web && (
                <div>
                  <dt>Site web</dt>
                  <dd>
                    <a href={partenaire.site_web} target="_blank" rel="noreferrer noopener">
                      <Globe size={14} aria-hidden="true" /> Visiter le site <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">(ouvre un nouvel onglet)</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <p className="vt-note">
              Ni date d'échéance, ni durée de la convention, ni document interne ne sont affichés.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
