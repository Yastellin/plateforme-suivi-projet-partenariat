import { CheckSquare, Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionsSoumissionMasseProps {
  actif: boolean;
  nombreSelectionne: number;
  enCours: boolean;
  desactive?: boolean;
  onActiver: () => void;
  onAnnuler: () => void;
  onSoumettre: () => void;
}

/**
 * Command bar partagée par les trois agrégats soumis à la Présidence.
 * Le composant ne connaît pas les données : chaque liste conserve la règle de
 * sélection de ses propres brouillons (Command + Presentation patterns).
 */
export function ActionsSoumissionMasse({
  actif,
  nombreSelectionne,
  enCours,
  desactive = false,
  onActiver,
  onAnnuler,
  onSoumettre,
}: ActionsSoumissionMasseProps) {
  if (!actif) {
    return (
      <Button type="button" variant="outline" onClick={onActiver} disabled={desactive}>
        <CheckSquare className="h-3.5 w-3.5" />
        Sélectionner à soumettre
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
        <X className="h-3.5 w-3.5" />
        Annuler
      </Button>
      <Button type="button" onClick={onSoumettre} disabled={enCours || nombreSelectionne === 0}>
        {enCours ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Soumettre la sélection ({nombreSelectionne})
      </Button>
    </>
  );
}
