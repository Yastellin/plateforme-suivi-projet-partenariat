// src/components/layout/TopbarPublique.tsx
import { useEffect, useState } from "react"
import { NavLink, Link } from "react-router-dom"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useConfigurationPublique } from "@/features/espace-public/api/useConfigurationPublique"
import { resoudreUrlFichier } from "@/lib/url"
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

// Barre de navigation moderne : verre depoli au defilement, indicateur
// anime (layoutId) sous le lien actif, menu mobile deroulant.
export function TopbarPublique() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [defile, setDefile] = useState(
    () => typeof window !== "undefined" && window.scrollY > 8,
  )
  const [logoUrlEnErreur, setLogoUrlEnErreur] = useState<string | null>(null)
  const { data: configuration } = useConfigurationPublique()
  const logoUrl = configuration?.logo_url ?? null
  const afficherLogo = Boolean(logoUrl && logoUrlEnErreur !== logoUrl)

  useEffect(() => {
    const surveiller = () => setDefile(window.scrollY > 8)
    window.addEventListener("scroll", surveiller, { passive: true })
    return () => window.removeEventListener("scroll", surveiller)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        defile
          ? "border-border/80 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-sm font-bold shadow-md transition-transform duration-300 group-hover:scale-105",
              afficherLogo
                ? "border border-border bg-background shadow-black/10"
                : "bg-gradient-to-br from-primary to-[var(--color-brand-deep)] text-primary-foreground shadow-primary/30",
            )}
          >
            {afficherLogo && logoUrl ? (
              <img
                src={resoudreUrlFichier(logoUrl)}
                alt="Logo de la Présidence"
                className="h-full w-full object-contain p-0.5"
                onError={() => setLogoUrlEnErreur(logoUrl)}
              />
            ) : (
              "SP"
            )}
          </span>
          <span className="font-heading text-base font-semibold text-foreground">
            Suivi Partenariats
          </span>
        </Link>

        <LayoutGroup id="nav-publique">
          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/60 p-1 lg:flex">
            {LIENS_NAV.map((lien) => (
              <NavLink
                key={lien.href}
                to={lien.href}
                end={lien.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-publique-pastille"
                        className="absolute inset-0 -z-10 rounded-full bg-accent"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    {lien.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </LayoutGroup>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="rounded-full px-4 shadow-md shadow-primary/20"
          >
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
            aria-expanded={menuOuvert}
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOuvert((v) => !v)}
          >
            {menuOuvert ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOuvert && (
          <motion.nav
            key="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {LIENS_NAV.map((lien, i) => (
                <motion.div
                  key={lien.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.2 }}
                >
                  <NavLink
                    to={lien.href}
                    end={lien.href === "/"}
                    onClick={() => setMenuOuvert(false)}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground",
                      )
                    }
                  >
                    {lien.label}
                  </NavLink>
                </motion.div>
              ))}
              <Link
                to="/connexion"
                onClick={() => setMenuOuvert(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20"
              >
                <LogIn size={16} />
                Espace privé
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
