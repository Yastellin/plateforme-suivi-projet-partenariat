// src/features/espace-public/pages/AccueilPage.tsx
import { Link } from "react-router-dom"
import { ArrowRight, Mail } from "lucide-react"
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
    <div>
      <HeroAccueil />
      <SectionPublicationsAlaUne />
      <SectionProjetsAlaUne />
      <SectionPartenaires />
      <SectionEtablissements />

      <section className="vt-section">
        <div className="vt-wrap">
          <Reveal>
            <div className="vt-band">
              <div>
                <h2>Vous souhaitez collaborer ?</h2>
                <p>
                  Porteur de projet, partenaire ou étudiant : écrivez-nous. Votre message est transmis à la Présidence
                  ou à l'établissement concerné.
                </p>
              </div>
              <Link to="/contact" className="vt-btn vt-btn-light">
                <Mail size={16} aria-hidden="true" />
                Nous écrire
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
