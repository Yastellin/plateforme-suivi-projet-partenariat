// src/components/shared/DestructiveConfirmDialog.tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DestructiveConfirmDialogProps {
  ouvert: boolean
  onFermer: () => void
  onConfirmer: () => void
  titre: string
  description: string
  texteConfirmation: string
  libelleBouton?: string
  enCours?: boolean
}

export function DestructiveConfirmDialog({
  ouvert,
  onFermer,
  onConfirmer,
  titre,
  description,
  texteConfirmation,
  libelleBouton = "Confirmer",
  enCours = false,
}: DestructiveConfirmDialogProps) {
  const [saisie, setSaisie] = useState("")

  const peutConfirmer = saisie.trim().toLowerCase() === texteConfirmation.trim().toLowerCase()

  function gererFermer() {
    setSaisie("")
    onFermer()
  }

  function gererConfirmer() {
    onConfirmer()
    setSaisie("")
  }

  return (
    <Dialog open={ouvert} onOpenChange={gererFermer}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-[13px] text-muted-foreground">
            Tapez <span className="font-semibold text-foreground">{texteConfirmation}</span> pour confirmer :
          </p>
          <Input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder={texteConfirmation}
            className="text-[13px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={gererFermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={gererConfirmer}
            disabled={!peutConfirmer || enCours}
          >
            {enCours ? "En cours..." : libelleBouton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
