// Grille des logos des partenaires publics alimentée par l'API.
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { BoutonVoirTout, EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionPartenaires() {
  const { data, isLoading } = usePublicPartenaires({ page: 1, limit: 100 })
  const partenaires = (data?.data ?? []).filter((partenaire) => partenaire.logo_url)

  return (
    <section
      className="vt-section"
      id="partenaires"
      aria-labelledby="titre-partenaires"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-partenaires"
          surTitre="RÉSEAU D'EXCELLENCE"
          titre="Nos"
          titreAccent="Partenaires"
          sousTitre="Les organisations partenaires de l'Université de Fianarantsoa."
          direction="left"
        />
        {isLoading ? (
          <div className="vt-partner-grid" aria-label="Chargement des partenaires" aria-busy="true">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : partenaires.length > 0 ? (
          <RevealGroup className="vt-partner-grid" direction="left">
            {partenaires.map((partenaire) => (
              <RevealItem key={partenaire.id} className="vt-partner-grid-item">
                <Link
                  to={`/partenaires/${partenaire.id}`}
                  className="vt-partner-logo-box"
                  aria-label={`Voir le partenaire ${partenaire.nom}`}
                >
                  <img src={partenaire.logo_url ?? undefined} alt={`Logo de ${partenaire.nom}`} loading="lazy" decoding="async" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="vt-muted" role="status">Aucun logo partenaire n'est disponible.</p>
        )}
        <BoutonVoirTout lien="/partenaires" libelle="Voir tous les partenaires" direction="left" />
      </div>
    </section>
  )
}
