// src/features/tableau-de-bord/pages/TableauDeBordEtablissement.tsx
import { useAuth } from "@/hooks/useAuth"

export function TableauDeBordEtablissement() {
  const { utilisateur, deconnecter } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p>Etablissement — {utilisateur?.identifiant}</p>
      <button onClick={deconnecter} className="underline">Se deconnecter</button>
    </div>
  )
}