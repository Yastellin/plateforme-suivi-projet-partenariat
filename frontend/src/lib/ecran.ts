// src/lib/ecran.ts
import { useEffect, useState } from "react"

// Vrai lorsque la requete media correspond (ex. "(max-width: 639px)").
export function useMediaQuery(requete: string): boolean {
  const [correspond, setCorrespond] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(requete).matches : false,
  )
  useEffect(() => {
    const media = window.matchMedia(requete)
    const mettreAJour = () => setCorrespond(media.matches)
    mettreAJour()
    media.addEventListener("change", mettreAJour)
    return () => media.removeEventListener("change", mettreAJour)
  }, [requete])
  return correspond
}
