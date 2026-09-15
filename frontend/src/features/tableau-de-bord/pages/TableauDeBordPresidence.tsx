// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx
import { useAuth } from "@/hooks/useAuth"

export function TableauDeBordPresidence() {
  const { utilisateur, deconnecter } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p>Presidence — {utilisateur?.identifiant}</p>
      <button onClick={deconnecter} className="underline">Se deconnecter</button>
    </div>
  )
}