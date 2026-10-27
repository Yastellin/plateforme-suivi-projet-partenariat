// src/features/espace-public/pages/AccueilPage.tsx
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionActualitesUne } from "@/features/espace-public/components/SectionActualitesUne"
import { SectionProjetsEnVedette } from "@/features/espace-public/components/SectionProjetsEnVedette"
import { SectionPartenairesEnVedette } from "@/features/espace-public/components/SectionPartenairesEnVedette"
import { BandeLogos } from "@/features/espace-public/components/BandeLogos"

export function AccueilPage() {
  return (
    <div>
      <HeroAccueil />
      <SectionActualitesUne />
      <SectionProjetsEnVedette />
      <SectionPartenairesEnVedette />
      <BandeLogos />
    </div>
  )
}
