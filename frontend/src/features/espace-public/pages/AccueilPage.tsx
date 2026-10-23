// src/features/espace-public/pages/AccueilPage.tsx
// Page d'accueil de la vitrine publique (maquette). Les donnees viennent de l'API
// (publications de la Presidence, etablissements, partenaires, compteurs).
import { Link } from "react-router-dom"
import { Briefcase, Building2, FlaskConical, Landmark, Mail, MessageSquare } from "lucide-react"
import { HeroAccueil } from "@/features/espace-public/components/HeroAccueil"
import { SectionEtablissements } from "@/features/espace-public/components/SectionEtablissements"
import { SectionPartenaires } from "@/features/espace-public/components/SectionPartenaires"
import { SectionPublicationsAlaUne } from "@/features/espace-public/components/SectionPublicationsAlaUne"
import { FormulaireContact } from "@/features/espace-public/components/FormulaireContact"
import { Reveal } from "@/features/espace-public/components/Reveal"

export function AccueilPage() {
  return (
    <div>
      <HeroAccueil />

      <section className="vt-section vt-section-alt" id="apropos">
        <Reveal className="vt-wrap vt-about">
          <div className="vt-about-txt">
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 34px)", fontWeight: 800, letterSpacing: "-0.015em" }}>
              Une université ouverte sur ses partenaires
            </h2>
            <p>
              L'Université de Fianarantsoa entretient des relations avec des entreprises, des institutions publiques, des
              organismes de recherche et des universités. Chaque établissement a ses propres partenaires, et certains sont
              partagés par toute l'université.
            </p>
            <p>
              Cette plateforme rend publics les partenariats et les projets que l'université choisit de montrer, pour que
              les étudiants, les familles et les futurs partenaires voient ce qui se fait concrètement.
            </p>
          </div>
          <div className="vt-axes">
            <div className="vt-axe">
              <span className="vt-ic"><Briefcase size={20} aria-hidden="true" /></span>
              <div>
                <h3>Insertion professionnelle</h3>
                <p>Stages, alternance et ateliers avec des partenaires du monde professionnel.</p>
              </div>
            </div>
            <div className="vt-axe">
              <span className="vt-ic"><FlaskConical size={20} aria-hidden="true" /></span>
              <div>
                <h3>Recherche et innovation</h3>
                <p>Laboratoires communs, cotutelles de thèse et travaux partagés.</p>
              </div>
            </div>
            <div className="vt-axe">
              <span className="vt-ic"><Landmark size={20} aria-hidden="true" /></span>
              <div>
                <h3>Développement local</h3>
                <p>Projets menés avec les collectivités, les associations et les acteurs de la région.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SectionEtablissements />
      <SectionPartenaires />
      <SectionPublicationsAlaUne />

      <section className="vt-section" style={{ paddingTop: 0 }}>
        <div className="vt-wrap">
          <Reveal className="vt-band">
            <div>
              <h2>Vous représentez une entreprise ou une institution ?</h2>
              <p>Parlez-nous de votre projet. Votre message est transmis à la Présidence ou à l'établissement concerné.</p>
            </div>
            <Link to="/contact" className="vt-btn vt-btn-light">
              <Mail size={16} aria-hidden="true" />
              Nous écrire
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="vt-section vt-section-alt" id="contact">
        <Reveal className="vt-wrap vt-contact">
          <div>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 34px)", fontWeight: 800, letterSpacing: "-0.015em" }}>Contact</h2>
            <p style={{ color: "var(--muted)", marginTop: 12, maxWidth: "46ch" }}>
              Une question sur un partenariat, une proposition de collaboration ou une demande d'information ? Choisissez
              le destinataire de votre message.
            </p>
            <div className="vt-info">
              <div>
                <span className="vt-ic"><Landmark size={20} aria-hidden="true" /></span>
                <p>
                  <b>Présidence de l'université</b>
                  <span>Par défaut, pour les partenariats et les demandes générales.</span>
                </p>
              </div>
              <div>
                <span className="vt-ic"><Building2 size={20} aria-hidden="true" /></span>
                <p>
                  <b>Un établissement</b>
                  <span>Sélectionnez-le dans le formulaire : il reçoit directement votre message.</span>
                </p>
              </div>
              <div>
                <span className="vt-ic"><MessageSquare size={20} aria-hidden="true" /></span>
                <p>
                  <b>Suivi par référence</b>
                  <span>Une référence unique vous est donnée à l'envoi.</span>
                </p>
              </div>
            </div>
          </div>
          <FormulaireContact />
        </Reveal>
      </section>
    </div>
  )
}
