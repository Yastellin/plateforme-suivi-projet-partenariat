// src/features/partenariats/components/SelectionPartenaires.tsx

import { useState } from 'react';
import { ChecklistSelection } from '@/components/forms/ChecklistSelection';
import { usePartenaires } from '@/features/partenaires/api/usePartenaires';
import { useDebounce } from '@/hooks/useDebounce';

const LIMITE_OPTIONS = 100;

interface SelectionPartenairesProps {
  selection: string[];
  libelles: Record<string, string>;
  onChange: (ids: string[], libellesAjoutes: Record<string, string>) => void;
  erreur?: string;
}

export function SelectionPartenaires({ selection, libelles, onChange, erreur }: SelectionPartenairesProps) {
  const [recherche, setRecherche] = useState('');
  const rechercheDifferee = useDebounce(recherche, 300);
  const { data, isLoading } = usePartenaires({ page: 1, limit: LIMITE_OPTIONS, recherche: rechercheDifferee });

  const options = (data?.data ?? []).map((partenaire) => ({
    id: partenaire.id,
    libelle: partenaire.nom,
    detail: `${partenaire.type}, ${partenaire.pays}`,
  }));

  return (
    <ChecklistSelection
      options={options}
      selection={selection}
      libelles={libelles}
      onChange={onChange}
      chargement={isLoading}
      messageVide={recherche ? 'Aucun partenaire ne correspond à cette recherche.' : 'Aucun partenaire disponible.'}
      recherche={{ valeur: recherche, onChange: setRecherche, placeholder: 'Rechercher un partenaire' }}
      erreur={erreur}
    />
  );
}