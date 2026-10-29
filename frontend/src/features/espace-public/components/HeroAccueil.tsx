// Hero d'accueil et compteurs alimentés par les données publiques.
import { Link } from "react-router-dom"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CompteurAnime } from "@/features/espace-public/components/CompteurAnime"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()
  const compteurs = data?.compteurs
  const statistiques = [
    { valeur: compteurs?.nombre_etablissements, libelle: "Établissements" },
    { valeur: compteurs?.nombre_partenaires, libelle: "Partenaires" },
    { valeur: compteurs?.nombre_projets_actifs, libelle: "Projets" },
    { valeur: compteurs?.nombre_pays_partenaires, libelle: "Pays partenaires" },
  ]

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
      <section className="vt-home-stats" aria-label="Chiffres clés">
        <div className="vt-wrap">
          <div className="vt-home-stats-grid">
            {statistiques.map(({ valeur, libelle }) => (
              <div className="vt-home-stat" key={libelle} aria-busy={isLoading}>
                <strong>{isLoading ? <Skeleton className="mx-auto h-8 w-16" /> : <CompteurAnime valeur={valeur ?? 0} />}</strong>
                <span>{libelle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
