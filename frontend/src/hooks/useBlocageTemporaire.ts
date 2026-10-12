// src/hooks/useBlocageTemporaire.ts

import { useEffect, useState } from "react"

export const DUREE_BLOCAGE_SECONDES = 60

const MESSAGE_TROP_DE_REQUETES = "Trop de requetes"

/**
 * Blocage temporaire d'un formulaire apres un rejet 429 de l'API
 * (limitation du nombre de requetes par minute et par IP).
 */
export function useBlocageTemporaire(dureeSecondes = DUREE_BLOCAGE_SECONDES) {
  const [secondesRestantes, setSecondesRestantes] = useState(0)

  useEffect(() => {
    if (secondesRestantes <= 0) {
      return
    }
    const intervalle = window.setInterval(() => {
      setSecondesRestantes((valeur) => Math.max(valeur - 1, 0))
    }, 1000)
    return () => window.clearInterval(intervalle)
  }, [secondesRestantes])

  return {
    secondesRestantes,
    bloque: secondesRestantes > 0,
    bloquer: () => setSecondesRestantes(dureeSecondes),
    estTropDeRequetes: (message: string) => message.includes(MESSAGE_TROP_DE_REQUETES),
  }
}
