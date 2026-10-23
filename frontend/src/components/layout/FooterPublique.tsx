// src/components/layout/FooterPublique.tsx
import { Link } from "react-router-dom"
import { Mail, MapPin, Phone } from "lucide-react"
import { LogoInstitutionnel } from "@/components/shared/LogoInstitutionnel"

const LIENS_RAPIDES = [
  { label: "À propos", href: "/a-propos" },
  { label: "Établissements", href: "/etablissements" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Projets & partenariats", href: "/projets-partenariats" },
  { label: "Contact", href: "/contact" },
]

// Pied de page de la vitrine publique : identite, liens rapides et coordonnees.
export function FooterPublique() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-gradient-to-b from-background to-accent/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <LogoInstitutionnel className="h-9 w-9 rounded-xl border border-border bg-white object-contain p-1 text-sm shadow-sm" />
            <span className="font-heading text-base font-semibold text-foreground">
              Suivi Partenariats
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Plateforme centralisée de suivi des projets et partenariats de
            l'Université de Fianarantsoa.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Navigation</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {LIENS_RAPIDES.map((lien) => (
              <li key={lien.href}>
                <Link
                  to={lien.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Contact</h2>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
              B.P. 402, Fianarantsoa 301, Madagascar
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-primary" />
              partenariats@univ-fianar.mg
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-primary" />
              +261 34 22 330 54
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Université de Fianarantsoa — Plateforme de suivi des projets et partenariats
        </p>
      </div>
    </footer>
  )
}
