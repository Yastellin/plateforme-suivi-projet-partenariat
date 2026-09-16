// src/components/shared/ConfirmDialog.tsx
import { LoaderCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  ouvert?: boolean
  open?: boolean
  onOpenChange: (ouvert: boolean) => void
  titre: string
  description: string
  libelleConfirmation?: string
  variante?: "default" | "destructive"
  destructif?: boolean
  enCours?: boolean
  onConfirmer?: () => void
  onConfirm?: () => void
}

// Modal de confirmation obligatoire avant toute action critique
// (archivage, soumission, publication, changement d'etape - section 8).
export function ConfirmDialog({
  ouvert,
  open,
  onOpenChange,
  titre,
  description,
  libelleConfirmation,
  variante,
  destructif,
  enCours,
  onConfirmer,
  onConfirm,
}: ConfirmDialogProps) {
  const estOuvert = ouvert ?? open ?? false
  const confirmationLabel = libelleConfirmation ?? "Confirmer"
  const varianteFinale = destructif ? "destructive" : variante ?? "default"
  const onValider = onConfirmer ?? onConfirm ?? (() => undefined)

  return (
    <Dialog open={estOuvert} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enCours}>
            Annuler
          </Button>
          <Button variant={varianteFinale} onClick={onValider} disabled={enCours}>
            {enCours && <LoaderCircle className="animate-spin" />}
            {confirmationLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
