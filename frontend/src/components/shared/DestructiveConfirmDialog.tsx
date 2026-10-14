// src/components/shared/DestructiveConfirmDialog.tsx

import { useEffect, useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DestructiveConfirmDialogProps {
  ouvert: boolean;
  onFermer: () => void;
  onConfirmer: () => void;
  titre: string;
  description: string;
  nomCible?: string;
  texteConfirmation?: string;
  libelleAction?: string;
  libelleBouton?: string;
  enCours?: boolean;
}

export function DestructiveConfirmDialog({
  ouvert,
  onFermer,
  onConfirmer,
  titre,
  description,
  nomCible,
  texteConfirmation,
  libelleAction,
  libelleBouton,
  enCours = false,
}: DestructiveConfirmDialogProps) {
  const [saisie, setSaisie] = useState('');
  const nomConfirmation = (texteConfirmation ?? nomCible ?? '').trim();
  const libelleBoutonFinal = libelleBouton ?? libelleAction ?? 'Confirmer';
  const correspond = saisie.trim() === nomConfirmation;

  useEffect(() => {
    if (ouvert) {
      setSaisie('');
    }
  }, [ouvert]);

  return (
    <Dialog open={ouvert} onOpenChange={(valeur) => !valeur && onFermer()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--status-expire-bg)] text-[var(--status-expire-fg)]">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <label htmlFor="confirmation-saisie" className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-text-secondary)]">
            Tapez « {nomConfirmation || 'CONFIRMATION'} » pour confirmer
          </label>
          <input
            id="confirmation-saisie"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            autoComplete="off"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13.5px] outline-none focus:border-[var(--status-expire-fg)]"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onFermer}
            disabled={enCours}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirmer}
            disabled={!correspond || enCours}
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-sm)] border px-3.5 py-2 text-[13px] font-semibold text-white',
              'border-[var(--status-expire-fg)] bg-[var(--status-expire-fg)] hover:opacity-90',
              (!correspond || enCours) && 'cursor-not-allowed opacity-50 hover:opacity-50',
            )}
          >
            {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {libelleBoutonFinal}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}