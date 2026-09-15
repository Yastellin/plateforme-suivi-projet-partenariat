// src/components/forms/inputs/PhoneInputSanitized.tsx
import { forwardRef } from "react"
import { TextInputSanitized } from "./TextInputSanitized"

interface PhoneInputSanitizedProps extends Omit<React.ComponentProps<typeof TextInputSanitized>, "onChange"> {
  onChange?: (valeur: string) => void
}

// N'autorise que chiffres, +, espaces, tirets et parentheses ; tout
// autre caractere est supprime a la frappe.
const AUTORISES = /[^0-9+\s()-]/g

export const PhoneInputSanitized = forwardRef<HTMLInputElement, PhoneInputSanitizedProps>(
  ({ onChange, maxLength = 20, ...props }, ref) => {
    return (
      <TextInputSanitized
        ref={ref}
        type="tel"
        maxLength={maxLength}
        autoComplete="tel"
        placeholder="+261 34 00 000 00"
        onChange={(evenement) => {
          const brut = evenement.target.value
          const propre = brut.replace(AUTORISES, "")
          if (propre !== brut) {
            evenement.target.value = propre
          }
          onChange?.(propre)
        }}
        {...props}
      />
    )
  }
)

PhoneInputSanitized.displayName = "PhoneInputSanitized"
