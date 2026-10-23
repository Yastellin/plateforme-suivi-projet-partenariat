// src/features/espace-public/components/SectionPartenaires.tsx
// Partenaires a la une (maquette) : bande defilante continue avec la description
// de chaque partenaire. Pause au survol et au focus, et desactivee si l'utilisateur
// demande de reduire les animations. Moins de 4 partenaires : grille statique.
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

const SEUIL_DEFILEMENT = 4

export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []

  if (!isLoading && partenaires.length === 0) return null

  return (
    <section className="vt-section vt-section-alt" id="partenaires" aria-labelledby="titre-partenaires">
      <div className="vt-wrap">
        <Reveal className="vt-head">
          <div>
            <h2 id="titre-partenaires">Ils travaillent avec nous</h2>
            <p>Entreprises, institutions et universités partenaires. Passez la souris sur la bande pour la mettre en pause.</p>
          </div>
          <Link to="/projets-partenariats?onglet=partenaires" className="vt-btn vt-btn-ghost">
            Voir tous les partenaires
          </Link>
        </Reveal>
      </div>

      {isLoading ? (
        <div className="vt-wrap vt-pt-grid">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : partenaires.length < SEUIL_DEFILEMENT ? (
        <RevealGroup className="vt-wrap vt-pt-grid">
          {partenaires.map((p) => (
            <RevealItem key={p.id} className="h-full">
              <CartePartenaire partenaire={p} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <div className="vt-marq" role="region" aria-roledescription="carrousel" aria-label="Partenaires de l'université">
          <div className="vt-track">
            {partenaires.map((p) => (
              <CartePartenaire key={p.id} partenaire={p} />
            ))}
            {/* Copie decorative pour une boucle continue : non focalisable, masquee aux lecteurs d'ecran */}
            <div aria-hidden="true" inert style={{ display: "contents" }}>
              {partenaires.map((p) => (
                <CartePartenaire key={`copie-${p.id}`} partenaire={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
