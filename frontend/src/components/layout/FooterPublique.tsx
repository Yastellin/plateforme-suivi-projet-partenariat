// Pied de page public : identité, contacts, navigation et liens institutionnels.
import { Mail, MapPin, Phone } from "lucide-react"
import { Link } from "react-router-dom"
import { COORDONNEES_PUBLIQUES } from "@/features/espace-public/lib/coordonneesPubliques"

export function FooterPublique() {
  return (
    <footer className="vt-footer">
      <div className="vt-wrap">
        <div className="vt-footer-cols">
          <div className="vt-about-f">
            <Link to="/" className="vt-brandmark">
              <span className="vt-fanion" aria-hidden="true">UF</span>
              <span>
                <span className="vt-brand-name">Équipe Projet et Partenariat</span>
                <span className="vt-brand-sub">Université de Fianarantsoa</span>
              </span>
            </Link>
            <p>Université de Fianarantsoa</p>
            <ul className="vt-footer-contact" aria-label="Coordonnées">
              <li><MapPin size={15} aria-hidden="true" /><span>{COORDONNEES_PUBLIQUES.adresse}</span></li>
              <li><Mail size={15} aria-hidden="true" /><a href={`mailto:${COORDONNEES_PUBLIQUES.courriel}`}>{COORDONNEES_PUBLIQUES.courriel}</a></li>
              <li><Phone size={15} aria-hidden="true" /><a href={`tel:${COORDONNEES_PUBLIQUES.telephoneLien}`}>{COORDONNEES_PUBLIQUES.telephone}</a></li>
            </ul>
          </div>

          <div>
            <h4>Liens rapides</h4>
            <ul>
              <li><Link to="/actualites">Actualités</Link></li>
              <li><Link to="/partenariats">Partenariats</Link></li>
              <li><Link to="/projets">Projets</Link></li>
              <li><Link to="/partenaires">Partenaires</Link></li>
            </ul>
          </div>

          <div>
            <h4>Institution</h4>
            <ul>
              <li><Link to="/a-propos">À propos</Link></li>
              <li><span className="vt-footer-static-link">Gouvernance</span></li>
              <li><span className="vt-footer-static-link">Mentions légales</span></li>
              <li><span className="vt-footer-static-link">Politique de confidentialité</span></li>
            </ul>
          </div>

          <div>
            <h4>Suivez-nous</h4>
            <ul className="vt-footer-socials" aria-label="Réseaux sociaux">
              <li><span className="vt-footer-static-link">Facebook</span></li>
              <li><span className="vt-footer-static-link">LinkedIn</span></li>
              <li><span className="vt-footer-static-link">YouTube</span></li>
            </ul>
          </div>
        </div>
        <div className="vt-legal">
          <span>© {new Date().getFullYear()} Université de Fianarantsoa. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
