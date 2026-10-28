// src/features/espace-public/components/SectionPartenaires.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { BandeLogos } from "@/features/espace-public/components/BandeLogos"
import { Reveal } from "@/features/espace-public/components/Reveal"
import { BoutonVoirTout, EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

export function SectionPartenaires() {
  const { data, isLoading } = usePublicPartenaires({ page: 1, limit: 100 })
  const partenaires = data?.data ?? []

  return (
    <section
      className="vt-section"
      id="partenaires"
      aria-labelledby="titre-partenaires"
    >
      <div className="vt-wrap">
        <EnTeteSection
          idTitre="titre-partenaires"
          titre="Partenaires"
          sousTitre="Les organisations partenaires de l'Université de Fianarantsoa."
          direction="left"
        />
        {isLoading ? (
          <div
            className="vt-partner-logos-loading"
            aria-label="Chargement des partenaires"
            aria-busy="true"
          >
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-16 w-36" />
            ))}
          </div>
        ) : partenaires.length > 0 ? (
          <Reveal direction="left">
            <BandeLogos
              partenaires={partenaires.filter(
                (partenaire) => partenaire.logo_url,
              )}
            />
          </Reveal>
        ) : (
          <p className="vt-muted" role="status">
            Aucun partenaire public n'est disponible pour le moment.
          </p>
        )}
        <BoutonVoirTout lien="/partenaires" libelle="Voir tous les partenaires" direction="left" />
      </div>
    </section>
  )
}
