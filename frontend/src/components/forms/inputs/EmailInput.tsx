// src/components/forms/inputs/EmailInput.tsx
import { forwardRef } from "react"
import { TextInputSanitized } from "./TextInputSanitized"

type EmailInputProps = React.ComponentProps<typeof TextInputSanitized>

// Champ email : les caracteres invalides sont bloques a la frappe, la
// validation finale reste assuree par le schema Zod du formulaire.
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>((props, ref) => {
  return <TextInputSanitized ref={ref} type="email" autoComplete="email" {...props} />
})

EmailInput.displayName = "EmailInput"
