// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

// Tableau de bord global : compteurs et graphiques a implementer ulterieurement
// (fonctionnalite 5.20 du cahier des charges).
export function TableauDeBordPresidence() {
  const { utilisateur, deconnecter } = useAuth()

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-semibold">Bienvenue, {utilisateur?.email}</h1>
      <p className="text-sm text-muted-foreground">
        Le tableau de bord de la Presidence sera complete dans une prochaine etape.
      </p>
      <div>
        <Button onClick={deconnecter} variant="outline">
          Se deconnecter
        </Button>
      </div>
    </div>
  )
}