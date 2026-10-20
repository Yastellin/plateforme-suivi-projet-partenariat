// src/features/espace-public/components/SectionPartenaires.tsx
// Partenaires a la une : bande defilante continue, avec description de chaque
// partenaire. Pause au survol, au focus, par bouton, et desactivee si
// l'utilisateur demande de reduire les animations.
import { useState } from "react"
import { Pause, Play } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

const SEUIL_DEFILEMENT = 4

export function SectionPartenaires() {
  const { data, isLoading } = usePublicAccueil()
  const partenaires = data?.partenaires_a_la_une ?? []
  const [enPause, setEnPause] = useState(false)

  if (!isLoading && partenaires.length === 0) return null

  return (
    <section className="vt-section vt-section-alt" aria-labelledby="titre-partenaires">
      <div className="vt-wrap">
        <EnTeteSection
          etiquette="Coopération"
          titre="Nos partenaires"
          description="Les institutions qui accompagnent l'Université dans ses projets de recherche et de formation."
          lien={{ to: "/projets-partenariats?onglet=partenaires", libelle: "Tous les partenaires" }}
        />
      </div>

      {isLoading ? (
        <div className="vt-wrap" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : partenaires.length < SEUIL_DEFILEMENT ? (
        <div className="vt-wrap" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {partenaires.map((p) => (
            <CartePartenaire key={p.id} partenaire={p} />
          ))}
        </div>
      ) : (
        <>
          <div className="vt-marquee" data-pause={enPause} role="region" aria-roledescription="carrousel" aria-label="Partenaires de l'université">
            <div className="vt-track">
              {partenaires.map((p) => (
                <CartePartenaire key={p.id} partenaire={p} />
              ))}
              {/* Copie decorative pour une boucle continue : masquee aux lecteurs d'ecran */}
              <div aria-hidden="true" inert style={{ display: "contents" }}>
                {partenaires.map((p) => (
                  <CartePartenaire key={`copie-${p.id}`} partenaire={p} />
                ))}
              </div>
            </div>
          </div>
          <div className="vt-wrap" style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              className="vt-icon-btn"
              aria-pressed={enPause}
              aria-label={enPause ? "Reprendre le défilement des partenaires" : "Mettre en pause le défilement des partenaires"}
              onClick={() => setEnPause((p) => !p)}
            >
              {enPause ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
