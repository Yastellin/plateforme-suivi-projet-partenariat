// src/features/tableau-de-bord/components/CompteursGlobaux.tsx

import { Check, Clock, FolderKanban, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { cheminTableauDeBord } from '@/router';
import type { CompteursTableauDeBord } from '@/types/api';
import { CarteIndicateur } from './CarteIndicateur';

interface CompteursGlobauxProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

export function CompteursGlobaux({ compteurs, chargement }: CompteursGlobauxProps) {
  const { utilisateur } = useAuth();

  if (chargement || !compteurs) {
    return (
      <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-[164px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const base = utilisateur ? cheminTableauDeBord(utilisateur.role) : '';

  const partenairesActifs = compteurs.partenaires_actifs ?? compteurs.partenaires ?? 0;
  const projetsEnCours = compteurs.projets_en_cours ?? compteurs.projets ?? 0;
  const signees =
    (compteurs as { conventions_signees?: number }).conventions_signees ??
    (compteurs.repartition_conventions?.SIGNEE ?? 0) + (compteurs.repartition_conventions?.ACTIVE ?? 0);
  const enAttenteSignature = compteurs.repartition_conventions?.EN_ATTENTE_SIGNATURE ?? 0;
  const echeancesProches = compteurs.conventions_a_echeance ?? 0;

  return (
    <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CarteIndicateur
        titre="Partenaires actifs"
        valeur={partenairesActifs}
        icone={<Users className="h-[18px] w-[18px]" />}
        theme="emerald"
        lien={{ libelle: 'Voir la liste', chemin: `${base}/partenaires-partenariats/partenaires` }}
      />
      <CarteIndicateur
        titre="Projets en cours"
        valeur={projetsEnCours}
        icone={<FolderKanban className="h-[18px] w-[18px]" />}
        theme="blue"
        lien={{ libelle: 'Voir les projets', chemin: `${base}/projets` }}
      />
      <CarteIndicateur
        titre="Conventions signées"
        valeur={signees}
        icone={<Check className="h-[18px] w-[18px]" />}
        theme="violet"
        pied={`${enAttenteSignature} en attente de signature`}
      />
      <CarteIndicateur
        titre="Échéances proches"
        valeur={echeancesProches}
        icone={<Clock className="h-[18px] w-[18px]" />}
        theme="amber"
        pied={echeancesProches === 0 ? 'Aucune sous 30 jours' : `${echeancesProches} sous 30 jours`}
      />
    </div>
  );
}
