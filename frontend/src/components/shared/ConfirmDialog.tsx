// src/components/shared/ConfirmDialog.tsx

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  ouvert?: boolean;
  open?: boolean;
  onFermer?: () => void;
  onOpenChange?: (ouvert: boolean) => void;
  onConfirmer?: () => void;
  onConfirm?: () => void;
  titre: string;
  description: string;
  libelleAction?: string;
  libelleConfirmation?: string;
  libelleAnnulation?: string;
  enCours?: boolean;
  destructif?: boolean;
}

export function ConfirmDialog({
  ouvert,
  open,
  onFermer,
  onOpenChange,
  onConfirmer,
  onConfirm,
  titre,
  description,
  libelleAction = 'Confirmer',
  libelleConfirmation,
  libelleAnnulation = 'Annuler',
  enCours = false,
}: ConfirmDialogProps) {
  const isOpen = ouvert ?? open ?? false;
  const handleClose = onFermer ?? ((() => onOpenChange?.(false)) as () => void);
  const handleConfirm = onConfirmer ?? onConfirm ?? (() => undefined);
  const actionLabel = libelleConfirmation ?? libelleAction;

  return (
    <Dialog open={isOpen} onOpenChange={(valeur) => {
      if (!valeur) {
        handleClose();
      } else if (onOpenChange) {
        onOpenChange(valeur);
      }
    }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={enCours}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
          >
            {libelleAnnulation}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={enCours}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
          >
            {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {actionLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}