// src/hooks/useVisibilityGuard.ts
import { useEffect, useState } from "react"

// Renvoie true si l'onglet est actuellement visible, false s'il est masque.
// Sert a suspendre le polling (notifications) quand l'utilisateur change
// d'onglet, pour ne pas solliciter le serveur inutilement (section 2 du prompt).
export function useVisibilityGuard(): boolean {
  const [estVisible, setEstVisible] = useState(() => document.visibilityState === "visible")

  useEffect(() => {
    const gererChangement = () => setEstVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", gererChangement)
    return () => document.removeEventListener("visibilitychange", gererChangement)
  }, [])

  return estVisible
}