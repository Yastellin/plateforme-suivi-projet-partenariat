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
  ouvert: boolean
  onOpenChange: (ouvert: boolean) => void
  titre: string
  description: string
  libelleConfirmation: string
  variante?: "default" | "destructive"
  enCours?: boolean
  onConfirmer: () => void
}

// Modal de confirmation obligatoire avant toute action critique
// (archivage, soumission, publication, changement d'etape - section 8).
export function ConfirmDialog({
  ouvert,
  onOpenChange,
  titre,
  description,
  libelleConfirmation,
  variante = "default",
  enCours,
  onConfirmer,
}: ConfirmDialogProps) {
  return (
    <Dialog open={ouvert} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enCours}>
            Annuler
          </Button>
          <Button variant={variante} onClick={onConfirmer} disabled={enCours}>
            {enCours && <LoaderCircle className="animate-spin" />}
            {libelleConfirmation}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
