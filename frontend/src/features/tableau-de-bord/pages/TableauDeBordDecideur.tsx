// src/features/tableau-de-bord/pages/TableauDeBordDecideur.tsx
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { CompteursGlobaux } from "@/features/tableau-de-bord/components/CompteursGlobaux"
import { GraphiqueStatuts } from "@/features/tableau-de-bord/components/GraphiqueStatuts"
import { GraphiqueComparatif } from "@/features/tableau-de-bord/components/GraphiqueComparatif"
import { EcheancierListe } from "@/features/tableau-de-bord/components/EcheancierListe"
import { StatusStrip } from "@/components/shared/StatusStrip"
import { useTableauDeBord } from "@/features/tableau-de-bord/api/useTableauDeBord"
import { Skeleton } from "@/components/ui/skeleton"

// Tableau de bord en lecture seule stricte (RG32) pour le role Decideur.
// Aucune action de gestion : pas de boutons creer/modifier/supprimer.
// Offre une vue synthetique globale pour l'aide a la decision.
export function TableauDeBordDecideur() {
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
        <Skeleton className="h-48 rounded-md" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Tableau de bord — Synthèse
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue consolidée des projets, partenariats et conventions.
        </p>
      </div>

      <CompteursGlobaux compteurs={compteurs} />

      <div className="grid gap-6 lg:grid-cols-2">
        <GraphiqueStatuts compteurs={compteurs} />
        <GraphiqueComparatif />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold">
          Échéances à venir
        </h2>
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
            description: `${compteurs.projets_par_statut["EN_ATTENTE"] ?? 0} projet${(compteurs.projets_par_statut["EN_ATTENTE"] ?? 0) > 1 ? "s" : ""} en préparation`,
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
