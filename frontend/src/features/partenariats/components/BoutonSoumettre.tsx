// src/features/partenariats/components/BoutonSoumettre.tsx
import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useSoumettrePartenariat } from "@/features/partenariats/api/useSoumettrePartenariat"

interface BoutonSoumettreProps {
  partenariatId: string
  disabled?: boolean
}

export function BoutonSoumettre({ partenariatId, disabled }: BoutonSoumettreProps) {
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const soumission = useSoumettrePartenariat(partenariatId)

  const handleSoumettre = () => {
    soumission.mutate(undefined, {
      onSuccess: () => {
        toast.success("Partenariat soumis a la Presidence")
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
        titre="Soumettre ce partenariat ?"
        description="Une fois soumis, vous ne pourrez plus le modifier. La Presidence prendra le relais pour la suite du traitement."
        onConfirm={handleSoumettre}
        enCours={soumission.isPending}
        libelleConfirmation="Soumettre"
        destructif={false}
      />
    </>
  )
}