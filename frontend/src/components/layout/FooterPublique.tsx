// src/components/layout/FooterPublique.tsx
import { Link } from "react-router-dom"

// Pied de page de la vitrine publique (style maquette). Ne contient que des
// liens reels de la plateforme : aucune coordonnee de contact n'est inventee.
export function FooterPublique() {
  return (
    <footer className="vt-footer">
      <div className="vt-wrap">
        <div className="vt-footer-cols">
          <div className="vt-about-f">
            <Link to="/" className="vt-brandmark">
              <span className="vt-fanion" aria-hidden="true">UF</span>
              <span>
                <span className="vt-brand-name">Partenariats UF</span>
                <span className="vt-brand-sub">Université de Fianarantsoa</span>
              </span>
            </Link>
            <p>Le suivi public des partenariats de l'université et de ses établissements.</p>
          </div>
          <div>
            <h4>Découvrir</h4>
            <ul>
              <li><Link to="/a-propos">À propos</Link></li>
              <li><Link to="/etablissements">Établissements</Link></li>
              <li><Link to="/projets-partenariats?onglet=partenaires">Partenaires</Link></li>
              <li><Link to="/projets-partenariats">Projets et partenariats</Link></li>
            </ul>
          </div>
          <div>
            <h4>Nous joindre</h4>
            <ul>
              <li><Link to="/contact">Formulaire de contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Accès réservé</h4>
            <ul>
              <li><Link to="/connexion">Espace interne</Link></li>
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
