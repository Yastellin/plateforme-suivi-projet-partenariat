// La navigation et le pied de page publics sont partagés par LayoutPublic.
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionActualitesUne } from "@/features/espace-public/components/SectionActualitesUne"
import { SectionPartenariats } from "@/features/espace-public/components/SectionPartenariats"
import { SectionProjetsEnVedette } from "@/features/espace-public/components/SectionProjetsEnVedette"
import { SectionPartenaires } from "@/features/espace-public/components/SectionPartenaires"

export function AccueilPage() {
  return (
    <div>
      <HeroAccueil />
      <SectionActualitesUne />
      <SectionPartenariats />
      <SectionProjetsEnVedette />
      <SectionPartenaires />
    </div>
  )
}
