// src/components/shared/UnsavedChangesDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesDialogProps {
  ouvert: boolean
  onConfirmer: () => void
  onAnnuler: () => void
}

export function UnsavedChangesDialog({ ouvert, onConfirmer, onAnnuler }: UnsavedChangesDialogProps) {
  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onAnnuler()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quitter sans enregistrer ?</DialogTitle>
          <DialogDescription>
            Vous avez des modifications non enregistrees. Si vous quittez cette page, vos changements seront perdus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onAnnuler}>Rester sur la page</Button>
          <Button variant="destructive" onClick={onConfirmer}>Quitter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
