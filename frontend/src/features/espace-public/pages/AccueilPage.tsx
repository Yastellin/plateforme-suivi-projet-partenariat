// src/features/espace-public/pages/AccueilPage.tsx
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionActualitesUne } from "@/features/espace-public/components/SectionActualitesUne"
import { SectionPartenaires } from "@/features/espace-public/components/SectionPartenaires"
import { SectionProjetsEnVedette } from "@/features/espace-public/components/SectionProjetsEnVedette"
import { SectionPartenariats } from "@/features/espace-public/components/SectionPartenariats"

export function AccueilPage() {
  return (
    <div>
      <HeroAccueil />
      <SectionActualitesUne />
      <SectionPartenaires />
      <SectionProjetsEnVedette />
      <SectionPartenariats />
    </div>
  )
}
