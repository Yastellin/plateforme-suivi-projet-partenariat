import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { StatusStrip, type ItemStatusStrip } from '@/components/shared/StatusStrip';
import type { CompteursTableauDeBord } from '@/types/api';

interface BandeauEtatProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

export function BandeauEtat({ compteurs, chargement }: BandeauEtatProps) {
  if (chargement || !compteurs) {
    return null;
  }

  const aEcheance = compteurs.conventions_a_echeance ?? 0;
  const projetsEnAttente = compteurs.projets_par_statut?.EN_ATTENTE ?? 0;
  const actives = compteurs.conventions_actives ?? 0;

  const items: ItemStatusStrip[] = [];

  if (aEcheance > 0) {
    items.push({
      icone: TriangleAlert,
      tonalite: 'attention',
      titre: `${aEcheance} convention${aEcheance > 1 ? 's' : ''} à échéance`,
      description: 'Dans moins de 30 jours — action requise',
    });
  }

  if (projetsEnAttente > 0) {
    items.push({
      icone: Info,
      tonalite: 'info',
      titre: `${projetsEnAttente} projet${projetsEnAttente > 1 ? 's' : ''} en attente`,
      description: 'En attente de validation par les établissements',
    });
  }

  if (actives > 0) {
    items.push({
      icone: CircleCheck,
      tonalite: 'ok',
      titre: `${actives} convention${actives > 1 ? 's' : ''} active${actives > 1 ? 's' : ''}`,
      description: 'Signées et en cours d’exécution',
    });
  }

  return <StatusStrip items={items} />;
}
