// Hero d'accueil et compteurs alimentés par les données publiques.
import { Link } from "react-router-dom"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CompteurAnime } from "@/features/espace-public/components/CompteurAnime"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()
  const compteurs = data?.compteurs

  function afficherNombre(valeur: number | undefined) {
    if (isLoading) {
      return <Skeleton className="h-14 w-24" aria-hidden="true" />
    }
    if (typeof valeur !== "number") {
      return <span aria-label="Donnée indisponible">—</span>
    }
    return <CompteurAnime valeur={valeur} />
  }

  return (
    <>
      <section className="vt-home-hero" aria-labelledby="titre-accueil">
        <div className="vt-wrap vt-home-hero-inner">
          <div className="vt-home-hero-content">
            <span className="vt-home-eyebrow">Université de Fianarantsoa</span>
            <h1 id="titre-accueil">
              Projets et <span>partenariats</span> de l'Université de Fianarantsoa
            </h1>
            <p>
              Découvrez les collaborations qui font avancer la formation, la recherche et le développement de notre région à travers le monde.
            </p>
            <div className="vt-cta">
              <Link to="/partenaires" className="vt-btn vt-btn-primary">Nos partenaires</Link>
              <Link to="/contact" className="vt-btn vt-btn-outline">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="vt-horizontal-timeline" aria-label="Chiffres clés de l'Université">
        <article className="vt-timeline-stat" aria-busy={isLoading}>
          <span className="vt-timeline-dot" aria-hidden="true" />
          <div className="vt-timeline-content">
            <strong className="vt-timeline-number">{afficherNombre(compteurs?.nombre_etablissements)}</strong>
            <span className="vt-timeline-label">Établissements</span>
          </div>
        </article>
        <article className="vt-timeline-stat" aria-busy={isLoading}>
          <span className="vt-timeline-dot" aria-hidden="true" />
          <div className="vt-timeline-content">
            <strong className="vt-timeline-number">{afficherNombre(compteurs?.nombre_partenaires)}</strong>
            <span className="vt-timeline-label">Partenaire</span>
          </div>
        </article>
        <article className="vt-timeline-stat" aria-busy={isLoading}>
          <span className="vt-timeline-dot" aria-hidden="true" />
          <div className="vt-timeline-content">
            <strong className="vt-timeline-number">{afficherNombre(compteurs?.nombre_projets_actifs)}</strong>
            <span className="vt-timeline-label">Projet</span>
          </div>
        </article>
        <article className="vt-timeline-stat" aria-busy={isLoading}>
          <span className="vt-timeline-dot" aria-hidden="true" />
          <div className="vt-timeline-content">
            <strong className="vt-timeline-number">{afficherNombre(compteurs?.nombre_pays_partenaires)}</strong>
            <span className="vt-timeline-label">Pays partenaire</span>
          </div>
        </article>
      </section>
    </>
  )
}
