// Hero d'accueil et compteurs alimentés par les données publiques.
import { Link } from "react-router-dom"
import { Building2 } from "lucide-react"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CompteurAnime } from "@/features/espace-public/components/CompteurAnime"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()
  const compteurs = data?.compteurs

  function afficherNombre(valeur: number | undefined, petiteCarte = false) {
    if (isLoading) {
      return <Skeleton className={petiteCarte ? "h-12 w-20" : "h-32 w-52"} aria-hidden="true" />
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
      <section className="vt-asymmetric-stats-section" aria-label="Chiffres clés de l'Université">
        <div className="vt-asymmetric-stats">
          <article className="vt-stat-big-main" aria-busy={isLoading}>
            <Building2
              size={160}
              strokeWidth={1}
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "-20px",
                bottom: "-20px",
                opacity: 0.1,
                color: "#fff",
              }}
            />
            <strong className="num">
              {afficherNombre(compteurs?.nombre_etablissements)}
            </strong>
            <h2 className="lbl">Établissements partenaires</h2>
            <p className="sub">
              Des collaborations académiques solides avec des institutions de premier plan.
            </p>
          </article>
          <div className="vt-stat-small-grid" role="group" aria-label="Autres chiffres publics">
            <article className="vt-stat-small-card" aria-busy={isLoading}>
              <strong className="num">
                {afficherNombre(compteurs?.nombre_partenaires, true)}
              </strong>
              <span className="lbl">Partenaire</span>
            </article>
            <article className="vt-stat-small-card" aria-busy={isLoading}>
              <strong className="num">
                {afficherNombre(compteurs?.nombre_projets_actifs, true)}
              </strong>
              <span className="lbl">Projet</span>
            </article>
            <article className="vt-stat-small-card" aria-busy={isLoading}>
              <strong className="num">
                {afficherNombre(compteurs?.nombre_pays_partenaires, true)}
              </strong>
              <span className="lbl">Pays partenaire</span>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
