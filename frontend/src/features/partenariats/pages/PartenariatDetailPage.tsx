// src/features/partenariats/pages/PartenariatDetailPage.tsx
import { useParams } from "react-router-dom"
import { useState } from "react"
import { Handshake } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PartenariatForm } from "@/features/partenariats/components/PartenariatForm"
import { BoutonSoumettre } from "@/features/partenariats/components/BoutonSoumettre"
import { usePartenariat } from "@/features/partenariats/api/usePartenariat"
import { useAuth } from "@/hooks/useAuth"

export function PartenariatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { utilisateur } = useAuth()
  const [modificationOuverte, setModificationOuverte] = useState(false)

  const { data: partenariat, isLoading } = usePartenariat(id)

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>
  }

  if (!partenariat) {
    return (
      <div className="p-6">
        <EmptyState icon={Handshake} titre="Partenariat introuvable" message="Ce partenariat n'existe pas ou a ete supprime." />
      </div>
    )
  }

  const modifiable = partenariat.statut === "BROUILLON" && utilisateur?.role === "ETABLISSEMENT"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{partenariat.intitule}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge statut={partenariat.statut} />
            <span className="text-sm text-muted-foreground">{partenariat.domaine}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {modifiable && (
            <button
              onClick={() => setModificationOuverte(true)}
              className="text-sm text-primary underline"
            >
              Modifier
            </button>
          )}
          {/* Section 5 : uniquement l'Etablissement peut soumettre, uniquement en BROUILLON */}
          {modifiable && <BoutonSoumettre partenariatId={partenariat.id} />}
        </div>
      </div>

      {partenariat.objet && (
        <p className="mb-4 text-sm text-muted-foreground">{partenariat.objet}</p>
      )}

      <div className="grid grid-cols-2 gap-6">
        {partenariat.actions_realisees && (
          <div>
            <h3 className="font-heading text-sm font-semibold">Actions realisees</h3>
            <p className="text-sm text-muted-foreground">{partenariat.actions_realisees}</p>
          </div>
        )}
        {partenariat.actions_en_cours && (
          <div>
            <h3 className="font-heading text-sm font-semibold">Actions en cours</h3>
            <p className="text-sm text-muted-foreground">{partenariat.actions_en_cours}</p>
          </div>
        )}
      </div>

      <Dialog open={modificationOuverte} onOpenChange={setModificationOuverte}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le partenariat</DialogTitle>
          </DialogHeader>
          <PartenariatForm
            partenariat={partenariat}
            onSucces={() => {
              setModificationOuverte(false)
              toast.success("Partenariat mis a jour")
            }}
            onAnnuler={() => setModificationOuverte(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}