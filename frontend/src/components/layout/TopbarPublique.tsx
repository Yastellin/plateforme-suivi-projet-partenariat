// src/components/layout/TopbarPublique.tsx
import { useState } from "react"
import { NavLink, Link } from "react-router-dom"
import { Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { cn } from "@/lib/utils"

interface LienNav {
  label: string
  href: string
}

// Navigation de l'espace public (section 3 : vitrine accessible sans
// authentification). Distincte de <SidebarInterne> qui gere l'espace
// authentifie par role.
const LIENS_NAV: LienNav[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Établissements", href: "/etablissements" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Projets & partenariats", href: "/projets-partenariats" },
  { label: "Contact", href: "/contact" },
]

export function TopbarPublique() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOuvert(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            SP
          </span>
          <span className="font-heading text-base font-semibold text-foreground">
            Suivi Partenariats
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LIENS_NAV.map((lien) => (
            <NavLink
              key={lien.href}
              to={lien.href}
              end={lien.href === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
            >
              {lien.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/connexion">
              <LogIn size={16} />
              Espace privé
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOuvert((v) => !v)}
          >
            {menuOuvert ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {menuOuvert && (
        <nav className="flex flex-col gap-0.5 border-t border-border px-4 py-3 lg:hidden">
          {LIENS_NAV.map((lien) => (
            <NavLink
              key={lien.href}
              to={lien.href}
              end={lien.href === "/"}
              onClick={() => setMenuOuvert(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
            >
              {lien.label}
            </NavLink>
          ))}
          <Link
            to="/connexion"
            onClick={() => setMenuOuvert(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            <LogIn size={16} />
            Espace privé
          </Link>
        </nav>
      )}
    </header>
  )
}