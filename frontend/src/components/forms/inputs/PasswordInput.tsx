// src/components/forms/inputs/PasswordInput.tsx
import { forwardRef } from "react"
import { FloatingLabelInput } from "./FloatingLabelInput"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  aide?: string
  erreur?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Mot de passe", aide, erreur, ...props }, ref) => {
    return (
      <FloatingLabelInput
        ref={ref}
        type="password"
        autoComplete="current-password"
        placeholder={label}
        label={label}
        aide={aide}
        erreur={erreur}
        {...props}
      />
    )
  },
)

PasswordInput.displayName = "PasswordInput"
