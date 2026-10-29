// frontend/src/features/espace-public/components/PageIntrouvable.tsx
import { Link } from "react-router-dom"
import { ArrowRight, Home, Search } from "lucide-react"

interface PageIntrouvableProps {
  titre?: string
  description?: string
}

export function PageIntrouvable({
  titre = "Oups, cette page est introuvable",
  description = "Il semblerait que vous ayez suivi un lien brisé ou tapé une adresse incorrecte. Pas de panique, voici quelques liens pour vous réorienter.",
}: PageIntrouvableProps) {
  return (
    <div className="vt-page-introuvable">
      <div className="vt-404-card">
        <div className="vt-404-icon" aria-hidden="true">
          <Search size={100} strokeWidth={1.5} />
        </div>
        <h1>{titre}</h1>
        <p>{description}</p>
        <Link to="/" className="vt-404-btn">
          <Home size={18} aria-hidden="true" />
          Retour à l'accueil
        </Link>
        <nav className="vt-404-liens" aria-label="Liens utiles">
          <Link to="/actualites">Nos actualités <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link to="/projets">Nos projets <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link to="/partenaires">Nos partenaires <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link to="/contact">Contact <ArrowRight size={14} aria-hidden="true" /></Link>
        </nav>
      </div>
    </div>
  )
}
