// src/components/layout/TopbarPublique.tsx
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LockKeyhole, Menu, X } from "lucide-react"

interface LienNav {
  label: string
  href: string
}

// Navigation de la vitrine publique (accessible sans authentification).
const LIENS_NAV: LienNav[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Établissements", href: "/etablissements" },
  { label: "Partenaires", href: "/projets-partenariats?onglet=partenaires" },
  { label: "Projets et partenariats", href: "/projets-partenariats" },
  { label: "Contact", href: "/contact" },
]

// Deux liens peuvent partager le meme chemin (projets / partenaires) :
// l'etat actif tient compte du parametre "onglet".
function estActif(lien: LienNav, chemin: string, requete: string): boolean {
  const [cheminLien, requeteLien] = lien.href.split("?")
  if (cheminLien !== chemin) return false
  const onglet = new URLSearchParams(requete).get("onglet")
  if (requeteLien) return onglet === new URLSearchParams(requeteLien).get("onglet")
  return cheminLien !== "/projets-partenariats" || !onglet || onglet === "projets"
}

export function TopbarPublique() {
  const location = useLocation()
  // Le menu mobile est memorise avec la route ouverte : il se ferme seul a la navigation.
  const cleRoute = `${location.pathname}${location.search}`
  const [menuPour, setMenuPour] = useState<string | null>(null)
  const menuOuvert = menuPour === cleRoute

  return (
    <header className="vt-top">
      <div className="vt-wrap">
        <Link to="/" className="vt-brandmark" aria-label="Université de Fianarantsoa, accueil">
          <span className="vt-logo" aria-hidden="true">UF</span>
          <span>
            <span className="vt-brand-name">Partenariats UF</span>
            <span className="vt-brand-sub">Université de Fianarantsoa</span>
          </span>
        </Link>

        <button
          type="button"
          className="vt-menu-btn"
          aria-expanded={menuOuvert}
          aria-controls="vt-nav"
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuPour(menuOuvert ? null : cleRoute)}
        >
          {menuOuvert ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <nav id="vt-nav" className="vt-nav" aria-label="Navigation principale" data-open={menuOuvert}>
          {LIENS_NAV.map((lien) => (
            <Link
              key={lien.href}
              to={lien.href}
              aria-current={estActif(lien, location.pathname, location.search) ? "page" : undefined}
            >
              {lien.label}
            </Link>
          ))}
          <Link to="/connexion" className="vt-btn vt-btn-primary">
            <LockKeyhole size={16} aria-hidden="true" />
            Espace interne
          </Link>
        </nav>
      </div>
    </header>
  )
}
