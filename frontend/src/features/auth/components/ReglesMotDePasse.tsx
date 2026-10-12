// src/features/auth/components/ReglesMotDePasse.tsx

import { Check, Circle } from "lucide-react"
import { REGLES_MOT_DE_PASSE } from "@/lib/validators/mot-de-passe.schema"

export function ReglesMotDePasse({ valeur }: { valeur: string }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
      {REGLES_MOT_DE_PASSE.map((regle) => {
        const respectee = regle.verifie(valeur)

        return (
          <li
            key={regle.cle}
            className={`flex items-center gap-1.5 text-[11.5px] ${
              respectee ? "text-[var(--color-brand)]" : "text-[var(--color-text-secondary)]"
            }`}
          >
            {respectee ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {regle.libelle}
          </li>
        )
      })}
    </ul>
  )
}
