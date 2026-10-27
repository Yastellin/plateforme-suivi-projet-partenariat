// src/features/espace-public/components/BandeLogos.tsx
// "Ils nous font confiance" : carrousel lent de logos. Nuances de gris au repos,
// couleur au survol, pause au survol et au focus. Desactive si l'utilisateur
// demande de reduire les animations (classe .vt-track).
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"

export function BandeLogos() {
  const { data } = usePublicAccueil()
  const logos = (data?.partenaires_a_la_une ?? []).filter((p) => p.logo_url)
  if (logos.length === 0) return null

  const elements = (copie: boolean) =>
    logos.map((p) => (
      <span key={copie ? `copie-${p.id}` : p.id} className="vt-logo-item" title={p.nom}>
        <img src={p.logo_url ?? undefined} alt={copie ? "" : `Logo de ${p.nom}`} loading="lazy" decoding="async" />
      </span>
    ))

  return (
    <section className="vt-section" style={{ paddingTop: 0 }} aria-labelledby="titre-confiance">
      <div className="vt-wrap">
        <h2 id="titre-confiance" className="vt-logos-titre">
          Ils nous font confiance
        </h2>
      </div>
      {logos.length < 4 ? (
        <div className="vt-wrap vt-logos-statique">{elements(false)}</div>
      ) : (
        <div className="vt-marq vt-logos" role="region" aria-roledescription="carrousel" aria-label="Logos des partenaires">
          <div className="vt-track">
            {elements(false)}
            <div aria-hidden="true" inert style={{ display: "contents" }}>
              {elements(true)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
