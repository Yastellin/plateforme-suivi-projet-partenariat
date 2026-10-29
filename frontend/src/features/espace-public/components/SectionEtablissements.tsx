// src/features/espace-public/components/SectionEtablissements.tsx
// Etablissements publics affichés sur l'accueil, donnees de /public/accueil.
import { Link } from "react-router-dom"
import { ArrowRight, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"

export function SectionEtablissements() {
  const { data, isLoading } = usePublicAccueil()
  const etablissements = data?.etablissements_a_la_une ?? []

  if (!isLoading && etablissements.length === 0) return null

  return (
    <section className="vt-section" id="etablissements">
      <div className="vt-wrap">
        <Reveal className="vt-head">
          <div>
            <h2>Les établissements</h2>
            <p>Chaque établissement mène ses propres partenariats. Ouvrez sa fiche pour voir ses projets publics.</p>
          </div>
          <Link to="/etablissements" className="vt-btn vt-btn-ghost">
            Tous les établissements
          </Link>
        </Reveal>

        <RevealGroup className="vt-grid-e">
          {isLoading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
            : etablissements.map((etab) => (
                <RevealItem key={etab.id} className="h-full">
                <article className="vt-card">
                  <Link to="/etablissements" className="vt-card-link">
                    <div className="vt-card-row">
                      {etab.logo_url ? (
                        <span className="vt-mono">
                          <img src={etab.logo_url} alt="" loading="lazy" decoding="async" />
                        </span>
                      ) : (
                        <span className="vt-mono">
                          <ImageDefaut alt="" className="vt-image-defaut" />
                        </span>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <h3>{etab.nom}</h3>
                        {etab.sigle && (
                          <div className="vt-place">
                            <MapPin size={15} aria-hidden="true" />
                            {etab.sigle}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="vt-card-desc">
                      Fiche de l'établissement et projets publics.
                    </p>
                    <div className="vt-foot">
                      <span className="vt-muted">Voir la fiche</span>
                      <ArrowRight size={16} aria-hidden="true" color="#1B4D34" />
                    </div>
                  </Link>
                </article>
                </RevealItem>
              ))}
        </RevealGroup>
      </div>
    </section>
  )
}
