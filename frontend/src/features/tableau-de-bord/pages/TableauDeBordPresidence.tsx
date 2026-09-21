// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { GraphiqueStatuts } from "@/features/tableau-de-bord/components/GraphiqueStatuts"
import { GraphiqueComparatif } from "@/features/tableau-de-bord/components/GraphiqueComparatif"
import { EcheancierListe } from "@/features/tableau-de-bord/components/EcheancierListe"
import { StatusStrip } from "@/components/shared/StatusStrip"
import { useTableauDeBord } from "@/features/tableau-de-bord/api/useTableauDeBord"
import { Skeleton } from "@/components/ui/skeleton"

export function TableauDeBordPresidence() {
  const { data: compteurs, isLoading } = useTableauDeBord()

  if (isLoading || !compteurs) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    )
  }

  const nbEnAttente = compteurs.projets_par_statut["EN_ATTENTE"] ?? 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-md border border-border p-[20px]">
          <div className="woven-accent absolute inset-x-0 top-0" />
          <p className="mt-1 font-mono text-[30px] font-semibold text-foreground">{compteurs.nombre_partenaires}</p>
          <p className="text-[12px] text-muted-foreground">Partenaires</p>
        </div>
        <div className="rounded-md border border-border p-[20px]">
          <p className="font-mono text-[30px] font-semibold text-foreground">{compteurs.nombre_partenariats}</p>
          <p className="text-[12px] text-muted-foreground">Partenariats</p>
        </div>
        <div className="rounded-md border border-border p-[20px]">
          <p className="font-mono text-[30px] font-semibold text-foreground">{compteurs.nombre_cotutelles}</p>
          <p className="text-[12px] text-muted-foreground">Cotutelles</p>
        </div>
        <div className="rounded-md border border-border p-[20px]">
          <p className="font-mono text-[30px] font-semibold text-foreground">{compteurs.conventions_actives}</p>
          <p className="text-[12px] text-muted-foreground">Conventions actives</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GraphiqueStatuts compteurs={compteurs} />
        <GraphiqueComparatif />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold">Échéances à venir</h2>
        <EcheancierListe />
      </div>

      <StatusStrip
        items={[
          {
            icon: AlertTriangle,
            titre: "Conventions bientôt expirées",
            description: `${compteurs.conventions_bientot_expirees} convention${compteurs.conventions_bientot_expirees > 1 ? "s" : ""} nécessite une attention`,
            variante: "alerte",
          },
          {
            icon: Clock,
            titre: "En attente de signature",
            description: `${nbEnAttente} projet${nbEnAttente > 1 ? "s" : ""} en préparation`,
            variante: "attente",
          },
          {
            icon: CheckCircle,
            titre: "Conventions actives",
            description: `${compteurs.conventions_actives} convention${compteurs.conventions_actives > 1 ? "s" : ""} en cours de validité`,
            variante: "succes",
          },
        ]}
      />
    </div>
  )
}