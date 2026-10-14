// src/features/tableau-de-bord/components/BandeauEtat.tsx

import { ClockAlert, Send, FileCheck2 } from 'lucide-react';
import { StatusStrip } from '@/components/shared/StatusStrip';
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
  const enAttente = compteurs.repartition_conventions?.EN_ATTENTE_SIGNATURE ?? 0;
  const actives = compteurs.conventions_actives ?? 0;
  const signees = (compteurs.repartition_conventions?.SIGNEE ?? 0) + (compteurs.repartition_conventions?.ACTIVE ?? 0);
  const pourcentageSignees = actives > 0 ? Math.round((signees / actives) * 100) : 0;

  const items = [
    {
      icone: ClockAlert,
      titre: `${aEcheance} convention${aEcheance > 1 ? 's' : ''} à échéance`,
      description: 'Dans moins de 30 jours, action requise',
      tonalite: 'attention' as const,
    },
    {
      icone: Send,
      titre: `${enAttente} convention${enAttente > 1 ? 's' : ''} en attente`,
      description: 'Soumises récemment par les établissements',
      tonalite: 'info' as const,
    },
    {
      icone: FileCheck2,
      titre: `${actives} convention${actives > 1 ? 's' : ''} actives`,
      description: `Dont ${pourcentageSignees} % signées et en cours d'exécution`,
      tonalite: 'ok' as const,
    },
  ];

  return <StatusStrip items={items} />;
}
