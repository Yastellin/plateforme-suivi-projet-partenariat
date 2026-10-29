import { useId } from "react"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface CarteLateraleProps {
  titre: string
  children: ReactNode
  variante?: "standard" | "information" | "fiche"
  icone?: LucideIcon
}

// Carte réutilisable de la colonne latérale, avec un accent visuel selon le rôle.
export function CarteLaterale({
  titre,
  children,
  variante = "standard",
  icone: Icone,
}: CarteLateraleProps) {
  const titreId = useId()
  const classeVariante = variante === "information"
    ? "vt-carte-info"
    : variante === "fiche"
      ? "vt-carte-fiche"
      : ""

  return (
    <section className={`vt-carte-laterale ${classeVariante}`} aria-labelledby={titreId}>
      <h2 id={titreId}>
        {Icone && <Icone size={18} aria-hidden="true" />}
        {titre}
      </h2>
      <div className="vt-carte-laterale-contenu">{children}</div>
    </section>
  )
}
