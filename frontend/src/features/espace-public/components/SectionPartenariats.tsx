// src/features/espace-public/components/SectionPartenariats.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CarteMiseEnAvant, CartePartenariat, CarteStandard } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { BoutonVoirTout, EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionPartenariats() {
  const { data, isLoading } = usePublicPartenariatsPublies()
  const partenariats = data?.slice(0, 4) ?? []

  if (!isLoading && partenariats.length === 0) return null

  return (
    <section
      className="vt-section vt-section-alt"
      id="partenariats"
      aria-labelledby="titre-partenariats"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-partenariats"
          surTitre="COOPÉRATIONS"
          titre="Nos"
          titreAccent="Partenariats"
          sousTitre="Les coopérations entre établissements et partenaires."
          direction="left"
        />
        {isLoading ? (
          <div className="vt-accueil-card-grid">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : (
          <RevealGroup
            className={`vt-accueil-card-grid${partenariats.length === 1 ? " vt-card-grid-single" : ` vt-card-grid-${partenariats.length}`}`}
            direction="left"
          >
            {partenariats.map((partenariat) => (
              <RevealItem key={partenariat.id} className="vt-card-list-item h-full">
                {partenariats.length === 1 ? (
                  <CarteMiseEnAvant>
                    <CartePartenariat partenariat={partenariat} />
                  </CarteMiseEnAvant>
                ) : (
                  <CarteStandard>
                    <CartePartenariat partenariat={partenariat} />
                  </CarteStandard>
                )}
              </RevealItem>
            ))}
          </RevealGroup>
        )}
        <BoutonVoirTout lien="/partenariats" libelle="Voir tous les partenariats" direction="left" />
      </div>
    </section>
  )
}
