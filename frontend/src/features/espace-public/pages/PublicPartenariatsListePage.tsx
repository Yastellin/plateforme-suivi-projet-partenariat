// src/features/espace-public/pages/PublicPartenariatsListePage.tsx
import { Handshake } from "lucide-react"
import { ListePartenariatsPubliques } from "@/features/espace-public/components/ListePartenariatsPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"

export function PublicPartenariatsListePage() {
  return (
    <div className="vt-liste-page">
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenariats" }]} />
      </div>
      <PageHeaderPublique
        etiquette="Coopérations"
        icone={Handshake}
        titre="Nos partenariats"
        description="Les relations de coopération publiées entre les établissements de l'Université et leurs partenaires."
      />
      <section className="vt-section" aria-label="Liste des partenariats publiés">
        <div className="vt-wrap">
          <ListePartenariatsPubliques />
        </div>
      </section>
    </div>
  )
}
