// src/components/layout/TopbarPublique.tsx
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Hexagon, Menu, X } from "lucide-react"

interface LienNav {
  label: string
  href: string
}

// Navigation de la vitrine publique (accessible sans authentification).
const LIENS_NAV: LienNav[] = [
  { label: "Accueil", href: "/" },
  { label: "Actualités", href: "/actualites" },
  { label: "Projets", href: "/projets" },
  { label: "Partenariats", href: "/partenariats" },
  { label: "Établissements", href: "/etablissements" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
]

// Un lien est actif sur sa page et sur les pages de detail qui en dependent.
function estActif(lien: LienNav, chemin: string): boolean {
  if (lien.href === "/") return chemin === "/"
  return chemin === lien.href || chemin.startsWith(`${lien.href}/`)
}

export function TopbarPublique() {
  const location = useLocation()
  // Le menu mobile est memorise avec la route ouverte : il se ferme seul a la navigation.
  const cleRoute = `${location.pathname}${location.search}`
  const surAccueil = location.pathname === "/"
  const [menuPour, setMenuPour] = useState<string | null>(null)
  const menuOuvert = menuPour === cleRoute
  // La barre se réduit et gagne une ombre dès que la page est défilée.
  const [defile, setDefile] = useState(false)
  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 8)
    surDefilement()
    window.addEventListener("scroll", surDefilement, { passive: true })
    return () => window.removeEventListener("scroll", surDefilement)
  }, [])

  return (
    <header className="vt-top" data-defile={defile} data-transparent={surAccueil && !defile}>
      <div className="vt-wrap">
        <Link to="/" className="vt-brandmark" aria-label="Université de Fianarantsoa, accueil">
          <span className="vt-fanion" aria-hidden="true">UF</span>
          <span>
            <span className="vt-brand-name">
              <Hexagon className="vt-hex" size={13} aria-hidden="true" />
              Partenariats UF
            </span>
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
              aria-current={estActif(lien, location.pathname) ? "page" : undefined}
            >
              {lien.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
