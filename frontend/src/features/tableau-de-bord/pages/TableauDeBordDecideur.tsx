// src/features/tableau-de-bord/pages/TableauDeBordDecideur.tsx
import { useAuth } from "@/hooks/useAuth"

export function TableauDeBordDecideur() {
  const { utilisateur, deconnecter } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p>Decideur — {utilisateur?.identifiant}</p>
      <button onClick={deconnecter} className="underline">Se deconnecter</button>
    </div>
  )
}