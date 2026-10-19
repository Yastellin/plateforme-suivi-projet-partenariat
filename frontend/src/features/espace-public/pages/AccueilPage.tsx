// src/features/espace-public/pages/AccueilPage.tsx
import { Link } from "react-router-dom"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionPublicationsAlaUne } from "@/features/espace-public/components/SectionPublicationsAlaUne"
import { SectionProjetsAlaUne } from "@/features/espace-public/components/SectionProjetsAlaUne"
import { SectionPartenaires } from "@/features/espace-public/components/SectionPartenaires"
import { SectionEtablissements } from "@/features/espace-public/components/SectionEtablissements"
import { Reveal } from "@/features/espace-public/components/Reveal"

// Page d'accueil de la vitrine publique : toutes les donnees viennent de
// l'API (publications de la Presidence, projets, partenaires, compteurs).
export function AccueilPage() {
  return (
    <div className="flex flex-col gap-20 pb-4">
      <HeroAccueil />
      <SectionPublicationsAlaUne />
      <SectionProjetsAlaUne />
      <SectionPartenaires />
      <SectionEtablissements />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[var(--color-brand-deep)] px-6 py-14 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:px-12">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 -z-10 h-64 w-64 rounded-full bg-[var(--color-brand-moment)]/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Vous souhaitez collaborer ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Porteur de projet, partenaire ou étudiant : écrivez-nous. Votre message est transmis à la Présidence ou à l'établissement concerné.
            </p>
            <Button asChild className="mt-7 rounded-full bg-background px-6 text-foreground hover:bg-background/90" size="lg">
              <Link to="/contact">
                <Mail size={16} />
                Nous écrire
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
