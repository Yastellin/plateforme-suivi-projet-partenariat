// src/features/cotutelles/pages/CotutelleDetailPage.tsx
import { useState } from "react"
import { useParams } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CotutelleForm } from "@/features/cotutelles/components/CotutelleForm"
import { useCotutelle } from "@/features/cotutelles/api/useCotutelle"

export function CotutelleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [modificationOuverte, setModificationOuverte] = useState(false)
  const { data: cotutelle, isLoading } = useCotutelle(id)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
  }

  if (!cotutelle) {
    return (
      <div className="p-6">
        <EmptyState icon={GraduationCap} titre="Cotutelle introuvable" message="Cette cotutelle n'existe pas ou a ete supprimee." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{cotutelle.nom_doctorant}</h1>
          <p className="text-sm text-muted-foreground">
            {cotutelle.type === "COTUTELLE" ? "Co-tutelle" : "Co-encadrement"} — {cotutelle.specialite}
          </p>
        </div>
        <button onClick={() => setModificationOuverte(true)} className="text-sm text-primary underline">
          Modifier
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading text-sm font-semibold">Directeur de these (local)</h3>
          <p className="text-sm text-muted-foreground">{cotutelle.directeur_these_local || "—"}</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold">Directeur de these (partenaire)</h3>
          <p className="text-sm text-muted-foreground">{cotutelle.directeur_these_partenaire || "—"}</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold">Financement / bourse</h3>
          <p className="text-sm text-muted-foreground">{cotutelle.financement_bourse || "—"}</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold">Etat d'avancement</h3>
          <p className="text-sm text-muted-foreground">{cotutelle.etat_avancement || "—"}</p>
        </div>
      </div>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la cotutelle</DialogTitle>
          </DialogHeader>
          <CotutelleForm
            cotutelle={cotutelle}
            onSucces={() => {
              setModificationOuverte(false)
              toast.success("Cotutelle mise a jour")
            }}
            onAnnuler={() => setModificationOuverte(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}