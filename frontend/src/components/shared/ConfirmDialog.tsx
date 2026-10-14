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
  onConfirmer?: () => void;
  onConfirm?: () => void;
  onOpenChange?: (ouvert: boolean) => void;
  titre: string;
  description: string;
  libelleAction?: string;
  libelleAnnulation?: string;
  libelleConfirmation?: string;
  enCours?: boolean;
  destructif?: boolean;
}

export function ConfirmDialog({
  ouvert,
  open,
  onFermer,
  onConfirmer,
  onOpenChange,
  titre,
  description,
  libelleAction = 'Confirmer',
  libelleAnnulation = 'Annuler',
  libelleConfirmation,
  enCours = false,
  destructif = false,
  onConfirm,
}: ConfirmDialogProps) {
  const ouvertFinal = open ?? ouvert ?? false;
  const fermer = onFermer ?? (() => onOpenChange?.(false));
  const handleOpenChange = onOpenChange ?? ((valeur: boolean) => !valeur && fermer());
  const actionLabel = libelleConfirmation ?? libelleAction;
  const confirmerAction = onConfirmer ?? onConfirm ?? (() => undefined);

  return (
    <Dialog open={ouvertFinal} onOpenChange={(valeur) => handleOpenChange(valeur)}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={fermer}
            disabled={enCours}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
          >
            {libelleAnnulation}
          </button>
          <button
            type="button"
            onClick={confirmerAction}
            disabled={enCours}
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-60 ${destructif ? 'border-[var(--status-expire-fg)] bg-[var(--status-expire-fg)] hover:opacity-90' : 'border-[var(--color-brand)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)]'}`}
          >
            {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {actionLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}