// Accès permanent au formulaire de contact depuis la vitrine publique.
import { Mail } from "lucide-react"
import { Link } from "react-router-dom"

export function BoutonContactFlottant() {
  return (
    <Link to="/contact" className="vt-contact-flottant">
      <Mail size={16} aria-hidden="true" />
      <span>Nous contacter</span>
    </Link>
  )
}
