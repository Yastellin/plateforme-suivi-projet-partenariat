// src/features/espace-public/components/SectionPartenariats.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariat } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionPartenariats() {
  const { data, isLoading } = usePublicPartenariatsPublies()
  const partenariats = data?.slice(0, 3) ?? []

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
          titre="Partenariats"
          sousTitre="Les coopérations entre établissements et partenaires."
          lienVoirTout="/partenariats"
          libelleVoirTout="Voir tous les partenariats"
          direction="left"
        />
        {isLoading ? (
          <div className="vt-grid-p">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : (
          <RevealGroup className="vt-grid-p" direction="left">
            {partenariats.map((partenariat) => (
              <RevealItem key={partenariat.id} className="h-full">
                <CartePartenariat partenariat={partenariat} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
