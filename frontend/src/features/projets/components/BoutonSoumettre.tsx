// src/features/projets/components/BoutonSoumettre.tsx
import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useSoumettreProjet } from "@/features/projets/api/useSoumettreProjet"

export function BoutonSoumettre({ projetId, disabled }: { projetId: string; disabled?: boolean }) {
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const soumission = useSoumettreProjet(projetId)

  const handleSoumettre = () => {
    soumission.mutate(undefined, {
      onSuccess: () => {
        toast.success("Projet soumis à la Présidence")
        setConfirmOuvert(false)
      },
      onError: (erreur: Error) => toast.error(erreur.message),
    })
  }

  return (
    <>
      <Button onClick={() => setConfirmOuvert(true)} disabled={disabled}>
        <Send size={16} /> Soumettre à la Présidence
      </Button>
      <ConfirmDialog
        ouvert={confirmOuvert}
        onFermer={() => setConfirmOuvert(false)}
        titre="Soumettre ce projet ?"
        description="Une fois soumis, vous ne pourrez plus le modifier. La Présidence prendra la main pour la suite du suivi."
        onConfirmer={handleSoumettre}
        enCours={soumission.isPending}
        libelleAction="Soumettre"
      />
    </>
  )
}