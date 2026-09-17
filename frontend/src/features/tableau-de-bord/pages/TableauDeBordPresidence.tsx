// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx
import { CompteursGlobaux } from "@/features/tableau-de-bord/components/CompteursGlobaux"
import { GraphiqueStatuts } from "@/features/tableau-de-bord/components/GraphiqueStatuts"
import { GraphiqueComparatif } from "@/features/tableau-de-bord/components/GraphiqueComparatif"
import { EcheancierListe } from "@/features/tableau-de-bord/components/EcheancierListe"
import { useTableauDeBord } from "@/features/tableau-de-bord/api/useTableauDeBord"

export function TableauDeBordPresidence() {
  const { data: compteurs, isLoading } = useTableauDeBord()

  if (isLoading || !compteurs) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Tableau de bord</h1>
      <CompteursGlobaux compteurs={compteurs} />
      <div className="grid gap-6 lg:grid-cols-2">
        <GraphiqueStatuts compteurs={compteurs} />
        <GraphiqueComparatif />
      </div>
      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold">Echeances a venir</h2>
        <EcheancierListe />
      </div>
    </div>
  )
}