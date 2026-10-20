// src/features/espace-public/components/SectionEtablissements.tsx
// Etablissements mis en avant sur l'accueil, donnees de /public/accueil.
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"
import { initiales } from "@/features/espace-public/lib/publique"

const TEINTES = ["", "vt-mono-2", "vt-mono-3", "vt-mono-4", "vt-mono-5"]

export function SectionEtablissements() {
  const { data, isLoading } = usePublicAccueil()
  const etablissements = data?.etablissements_a_la_une ?? []

  if (!isLoading && etablissements.length === 0) return null

  return (
    <section className="vt-section">
      <div className="vt-wrap">
        <EnTeteSection
          etiquette="Réseau"
          titre="Nos établissements"
          description="Les facultés, écoles et instituts qui composent l'Université de Fianarantsoa."
          lien={{ to: "/etablissements", libelle: "Voir tous les établissements" }}
        />

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {isLoading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            : etablissements.map((etab, i) => (
                <article key={etab.id} className="vt-card">
                  <Link to="/etablissements" className="vt-card-link">
                    <div className="vt-card-body">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {etab.logo_url ? (
                          <img src={etab.logo_url} alt="" className="h-11 w-11 rounded-lg object-contain ring-1 ring-[var(--color-border)]" loading="lazy" />
                        ) : (
                          <span className={`vt-mono ${TEINTES[i % TEINTES.length]}`} aria-hidden="true">
                            {etab.sigle ?? initiales(etab.nom)}
                          </span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{etab.nom}</h3>
                          {etab.sigle && <p className="vt-muted" style={{ fontSize: 13 }}>{etab.sigle}</p>}
                        </div>
                      </div>
                      {etab.description && <p className="vt-muted">{etab.description}</p>}
                    </div>
                  </Link>
                </article>
              ))}
        </div>
      </div>
    </section>
  )
}
