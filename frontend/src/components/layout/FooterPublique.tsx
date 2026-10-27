// src/components/layout/FooterPublique.tsx
import { Link } from "react-router-dom"

// Pied de page de la vitrine publique : equipe, navigation et contact.
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
            <p>Le suivi public des partenariats de l'université et de ses établissements.</p>
          </div>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/actualites">Actualités</Link></li>
              <li><Link to="/projets">Projets</Link></li>
              <li><Link to="/partenariats">Partenariats</Link></li>
              <li><Link to="/etablissements">Établissements</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><Link to="/contact">Formulaire de contact</Link></li>
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
