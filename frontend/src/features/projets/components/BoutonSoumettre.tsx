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
        toast.success("Projet soumis a la Presidence")
        setConfirmOuvert(false)
      },
      onError: (erreur: Error) => toast.error(erreur.message),
    })
  }

  return (
    <>
      <Button onClick={() => setConfirmOuvert(true)} disabled={disabled}>
        <Send size={16} /> Soumettre a la Presidence
      </Button>
      <ConfirmDialog
        open={confirmOuvert}
        onOpenChange={setConfirmOuvert}
        titre="Soumettre ce projet ?"
        description="Une fois soumis, vous ne pourrez plus le modifier. La Presidence prendra la main pour ajouter les activites, gerer la convention et decider de la publication."
        onConfirm={handleSoumettre}
        enCours={soumission.isPending}
        libelleConfirmation="Soumettre"
        destructif={false}
      />
    </>
  )
}