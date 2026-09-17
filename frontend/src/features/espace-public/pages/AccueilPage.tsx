// src/features/espace-public/pages/AccueilPage.tsx
import { Link } from "react-router-dom"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionEtablissements } from "@/features/espace-public/components/SectionEtablissements"
import { SectionPartenaires } from "@/features/espace-public/components/SectionPartenaires"

// Page d'accueil de la vitrine publique (section 7.4) :
// carrousel hybride, compteurs animes, fade-in au scroll,
// marquee infini de logos partenaires.
export function AccueilPage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero : carrousel + compteurs + etablissements + marquee */}
      <HeroAccueil />

      {/* Section etablissements mis en avant */}
      <SectionEtablissements />

      {/* Section partenaires (marquee) */}
      <SectionPartenaires />

      {/* Call to action contact */}
      <section className="bg-accent/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Une question ? Contactez-nous
          </h2>
          <p className="mt-3 text-muted-foreground">
            Notre équipe est à votre disposition pour toute information
            concernant les projets et partenariats de l'Université.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link to="/contact">
              <Mail size={16} />
              Nous contacter
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
