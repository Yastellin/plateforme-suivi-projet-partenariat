// src/features/conventions/pages/ConventionDetailPage.tsx
import { useState } from "react"
import { useParams } from "react-router-dom"
import { FileText } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"
import { CircuitTraitementStepper } from "@/features/conventions/components/CircuitTraitementStepper"
import { useConvention } from "@/features/conventions/api/useConvention"

export function ConventionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const { data: convention, isLoading } = useConvention(id)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
  }

  if (!convention) {
    return (
      <div className="p-6">
        <EmptyState icon={FileText} titre="Convention introuvable" message="Cette convention n'existe pas ou a ete supprimee." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{convention.titre}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{convention.reference}</span>
            <StatusBadge statut={convention.statut} />
          </div>
        </div>
        <button onClick={() => setModificationOuverte(true)} className="text-sm text-primary underline">
          Modifier
        </button>
      </div>

      {convention.statut === "BROUILLON" || convention.statut === "EN_ATTENTE_SIGNATURE" ? (
        <div className="mb-6 rounded-md border border-border p-4">
          <h3 className="mb-3 font-heading text-sm font-semibold">Circuit de traitement</h3>
          <CircuitTraitementStepper convention={convention} />
        </div>
      ) : null}

      {convention.description && (
        <p className="text-sm text-muted-foreground">{convention.description}</p>
      )}

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la convention</DialogTitle>
          </DialogHeader>
          <ConventionForm
            convention={convention}
            onSucces={() => {
              setModificationOuverte(false)
              toast.success("Convention mise a jour")
            }}
            onAnnuler={() => setModificationOuverte(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}