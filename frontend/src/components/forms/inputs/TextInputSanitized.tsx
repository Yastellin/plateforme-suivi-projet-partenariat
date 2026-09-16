// src/components/forms/inputs/TextInputSanitized.tsx
import { forwardRef } from "react"
import { Input } from "@/components/ui/input"

interface TextInputSanitizedProps extends React.ComponentProps<typeof Input> {
  // Regex des caracteres interdits : bloque a la frappe (section 8,
  // validation temps reel bloquante). Par defaut : caracteres de controle.
  caracteresInterdits?: RegExp
}

// Neutralise les caracteres de controle et tronque a maxLength avant que
// la valeur n'atteigne le formulaire.
function nettoyer(valeur: string, interdits: RegExp, maxLength?: number) {
  let resultat = valeur.replace(interdits, "")
  if (maxLength !== undefined && resultat.length > maxLength) {
    resultat = resultat.slice(0, maxLength)
  }
  return resultat
}

export const TextInputSanitized = forwardRef<HTMLInputElement, TextInputSanitizedProps>(
  // \p{C} couvre les caracteres de controle sans les ecrire litteralement.
  ({ caracteresInterdits = /\p{C}/gu, maxLength, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        maxLength={maxLength}
        onChange={(evenement) => {
          const entree = evenement.target
          const propre = nettoyer(entree.value, caracteresInterdits, maxLength)
          if (propre !== entree.value) {
            entree.value = propre
          }
          onChange?.(evenement)
        }}
        {...props}
      />
    )
  }
)

TextInputSanitized.displayName = "TextInputSanitized"
