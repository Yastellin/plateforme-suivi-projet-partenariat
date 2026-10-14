import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

interface ValeurTitreBreadcrumb {
  titre: string | null
  definirTitre: (titre: string | null) => void
}

export const ContexteTitreBreadcrumb =
  createContext<ValeurTitreBreadcrumb | null>(null)

export function TitreBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [titre, setTitre] = useState<string | null>(null)
  return (
    <ContexteTitreBreadcrumb.Provider value={{ titre, definirTitre: setTitre }}>
      {children}
    </ContexteTitreBreadcrumb.Provider>
  )
}

export function useTitreBreadcrumb(titre: string | null | undefined) {
  const ctx = useContext(ContexteTitreBreadcrumb)
  const definirTitre = ctx?.definirTitre

  useEffect(() => {
    if (!definirTitre) return
    definirTitre(titre ?? null)
    return () => definirTitre(null)
  }, [titre, definirTitre])
}