// src/features/tableau-de-bord/pages/TableauDeBordDecideur.tsx
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

// Tableau de bord en lecture seule stricte (RG32) : aucune action de gestion.
export function TableauDeBordDecideur() {
  const { utilisateur, deconnecter } = useAuth()

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-semibold">Bienvenue, {utilisateur?.email}</h1>
      <p className="text-sm text-muted-foreground">
        Votre tableau de bord sera complete dans une prochaine etape.
      </p>
      <div>
        <Button onClick={deconnecter} variant="outline">
          Se deconnecter
        </Button>
      </div>
    </div>
  )
}