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
  ouvert: boolean;
  onFermer: () => void;
  onConfirmer: () => void;
  titre: string;
  description: string;
  libelleAction?: string;
  libelleAnnulation?: string;
  enCours?: boolean;
}

export function ConfirmDialog({
  ouvert,
  onFermer,
  onConfirmer,
  titre,
  description,
  libelleAction = 'Confirmer',
  libelleAnnulation = 'Annuler',
  enCours = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={ouvert} onOpenChange={(valeur) => !valeur && onFermer()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={onFermer}
            disabled={enCours}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
          >
            {libelleAnnulation}
          </button>
          <button
            type="button"
            onClick={onConfirmer}
            disabled={enCours}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
          >
            {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {libelleAction}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}