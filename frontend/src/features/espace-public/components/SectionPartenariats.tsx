import { FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariatTimeline } from "@/features/espace-public/components/CartesPubliques"
import {
  RevealGroup,
  RevealItem,
} from "@/features/espace-public/components/Reveal"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

export function SectionPartenariats() {
  const { data, isLoading } = usePublicPartenariatsPublies()
  const partenariats = data?.slice(0, 4) ?? []

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
          lienTout="/partenariats"
          libelleTout="Voir tous les partenariats"
          direction="left"
        />
        {isLoading ? (
          <div className="vt-timeline" aria-busy="true">
            {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-40 rounded-xl" />)}
          </div>
        ) : partenariats.length === 0 ? (
          <EmptyStateSection
            icone={<FileText aria-hidden="true" />}
            titre="Les partenariats seront bientôt en ligne"
            description="Découvrez les coopérations entre les établissements et leurs partenaires."
            actionLibelle="Devenir partenaire"
            actionHref="/contact"
          />
        ) : (
          <RevealGroup className="vt-timeline" direction="left">
            {partenariats.map((partenariat) => (
              <RevealItem key={partenariat.id} className="vt-timeline-item">
                <span className="vt-timeline-point" aria-hidden="true" />
                <CartePartenariatTimeline partenariat={partenariat} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
