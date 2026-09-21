// src/components/forms/wizard/useWizardDraft.ts
import { useEffect, useCallback, useRef } from "react"

const PREFIX_CLE = "wizard-draft-"
const DELAI_MS = 30_000

interface UseWizardDraftOptions {
  cle: string
  donnees: Record<string, unknown>
  onRestaurer: (donnees: Record<string, unknown>) => void
}

export function useWizardDraft({ cle, donnees, onRestaurer }: UseWizardDraftOptions) {
  const cleStockage = PREFIX_CLE + cle
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const stocke = localStorage.getItem(cleStockage)
    if (stocke) {
      try {
        const parsed = JSON.parse(stocke) as Record<string, unknown>
        onRestaurer(parsed)
      } catch {
        localStorage.removeItem(cleStockage)
      }
    }
  }, [cleStockage])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      localStorage.setItem(cleStockage, JSON.stringify(donnees))
    }, DELAI_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [cleStockage, donnees])

  const viderBrouillon = useCallback(() => {
    localStorage.removeItem(cleStockage)
  }, [cleStockage])

  return { viderBrouillon }
}
