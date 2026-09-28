// src/features/partenariats/components/BoutonSoumettre.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useSoumettrePartenariat } from '../api/useSoumettrePartenariat';

interface BoutonSoumettreProps {
  partenariatId: string;
  intitule: string;
}

export function BoutonSoumettre({ partenariatId, intitule }: BoutonSoumettreProps) {
  const [ouvert, setOuvert] = useState(false);
  const { mutate, isPending } = useSoumettrePartenariat();

  function confirmer() {
    mutate(partenariatId, {
      onSuccess: () => {
        toast.success('Partenariat soumis');
        setOuvert(false);
      },
      onError: (erreur) => toast.error(erreur.message),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-brand)] hover:bg-[var(--color-active-zone)]"
      >
        <Send className="h-3.5 w-3.5" />
        Soumettre
      </button>

      <ConfirmDialog
        ouvert={ouvert}
        onFermer={() => setOuvert(false)}
        onConfirmer={confirmer}
        titre="Soumettre ce partenariat"
        description={`« ${intitule} » passera au statut En attente et ne pourra plus être modifié par l'établissement.`}
        libelleAction="Soumettre"
        enCours={isPending}
      />
    </>
  );
}