// src/components/layout/FooterPublique.tsx
import { Link } from "react-router-dom"

// Pied de page de la vitrine. Uniquement des liens vers les pages reelles :
// aucune coordonnee n'est codee en dur.
export function FooterPublique() {
  const annee = new Date().getFullYear()

  return (
    <footer className="vt-footer">
      <div className="vt-wrap">
        <div className="vt-footer-cols">
          <div>
            <Link to="/" className="vt-brand">
              <span className="vt-logo" aria-hidden="true">UF</span>
              <span>
                <span className="vt-brand-name">Partenariats UF</span>
                <span className="vt-brand-sub">Université de Fianarantsoa</span>
              </span>
            </Link>
            <p style={{ fontSize: 14.5, maxWidth: "34ch", marginTop: 14 }}>
              Le suivi public des partenariats de l'université et de ses établissements.
            </p>
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
              <li><Link to="/projets-partenariats?onglet=publications">Actualités</Link></li>
            </ul>
          </div>
          <div>
            <h4>Accès réservé</h4>
            <ul>
              <li><Link to="/connexion">Espace interne</Link></li>
              <li>Présidence et établissements</li>
            </ul>
          </div>
        </div>
        <div className="vt-footer-legal">
          <span>© {annee} Université de Fianarantsoa. Tous droits réservés.</span>
          <span>Données publiées par l'université.</span>
        </div>
      </div>
    </footer>
  )
}
