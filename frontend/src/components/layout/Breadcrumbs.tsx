// src/components/layout/Breadcrumbs.tsx
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

// Traduction des segments d'URL en libelles lisibles (section 6.1 : fil d'Ariane)
const LIBELLES: Record<string, string> = {
  presidence: "Presidence",
  etablissement: "Etablissement",
  decideur: "Decideur",
  "partenaires-partenariats": "Partenaires & partenariats",
  cotutelles: "Cotutelles",
  projets: "Projets",
  activites: "Activites",
  chronogramme: "Chronogramme",
  conventions: "Conventions",
  circuit: "Circuit de traitement",
  documents: "Documents",
  publications: "Publications",
  archives: "Archives",
  synthese: "Synthese annuelle",
  notifications: "Notifications",
  parametres: "Parametres",
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        const chemin = "/" + segments.slice(0, index + 1).join("/")
        const estDernier = index === segments.length - 1
        const libelle = LIBELLES[segment] ?? segment

        return (
          <span key={chemin} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} />}
            {estDernier ? (
              <span className="font-medium text-foreground">{libelle}</span>
            ) : (
              <Link to={chemin} className="hover:text-foreground">
                {libelle}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}