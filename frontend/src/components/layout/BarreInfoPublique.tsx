// Barre de coordonnées publiques affichée au-dessus de la navigation principale.
import { Mail, Phone } from "lucide-react"
import { COORDONNEES_PUBLIQUES } from "@/features/espace-public/lib/coordonneesPubliques"

export function BarreInfoPublique() {
  return (
    <div className="vt-info-top" role="group" aria-label="Coordonnées de l'Université">
      <div className="vt-wrap">
        <span className="vt-info-top-nom">Université de Fianarantsoa</span>
        <div className="vt-info-top-liens">
          <a href={`mailto:${COORDONNEES_PUBLIQUES.courriel}`}>
            <Mail size={13} aria-hidden="true" />
            {COORDONNEES_PUBLIQUES.courriel}
          </a>
          <a href={`tel:${COORDONNEES_PUBLIQUES.telephoneLien}`}>
            <Phone size={13} aria-hidden="true" />
            {COORDONNEES_PUBLIQUES.telephone}
          </a>
          <span className="vt-info-facebook">Facebook</span>
        </div>
      </div>
    </div>
  )
}
