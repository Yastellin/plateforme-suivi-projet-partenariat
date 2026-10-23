import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemandeModificationProjetDialog } from './DemandeModificationProjetDialog';

interface BoutonDemanderModificationProjetProps {
  projetId: string;
  projetNom: string;
  compact?: boolean;
}

export function BoutonDemanderModificationProjet({
  projetId,
  projetNom,
  compact = false,
}: BoutonDemanderModificationProjetProps) {
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogueOuvert(true)}
        disabled={demandeEnvoyee}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60',
          compact ? 'px-2.5 py-1.5 text-[12px]' : 'px-3.5 py-2 text-[13px]',
        )}
        aria-label={`Demander une modification pour ${projetNom}`}
      >
        <MessageSquareText
          className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
          aria-hidden="true"
        />
        {demandeEnvoyee ? 'Demande envoyée' : 'Demander une modification'}
      </button>

      <DemandeModificationProjetDialog
        ouvert={dialogueOuvert}
        projetId={projetId}
        projetNom={projetNom}
        onFermer={() => setDialogueOuvert(false)}
        onEnvoyee={() => setDemandeEnvoyee(true)}
      />
    </>
  );
}
