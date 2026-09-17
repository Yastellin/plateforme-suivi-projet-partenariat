// src/hooks/useDebounce.ts
import { useEffect, useState } from "react"

// Debounce ~300ms utilise par la recherche instantanee de toutes les listes
// (section 8) pour eviter de solliciter le serveur a chaque frappe.
export function useDebounce<T>(valeur: T, delaiMs = 300): T {
  const [valeurDifferree, setValeurDifferree] = useState(valeur)

  useEffect(() => {
    const minuteur = setTimeout(() => setValeurDifferree(valeur), delaiMs)
    return () => clearTimeout(minuteur)
  }, [valeur, delaiMs])

  return valeurDifferree
}
