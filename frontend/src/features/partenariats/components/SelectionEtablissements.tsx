// src/features/partenariats/components/SelectionEtablissements.tsx

import { useState } from 'react';
import { ChecklistSelection } from '@/components/forms/ChecklistSelection';
import { useEtablissements } from '@/features/etablissements/api/useEtablissements';

interface SelectionEtablissementsProps {
  selection: string[];
  libelles: Record<string, string>;
  onChange: (ids: string[], libellesAjoutes: Record<string, string>) => void;
  erreur?: string;
}

export function SelectionEtablissements({ selection, libelles, onChange, erreur }: SelectionEtablissementsProps) {
  const [recherche, setRecherche] = useState('');
  const { data, isLoading } = useEtablissements();

  const terme = recherche.trim().toLowerCase();

  const options = (data ?? [])
    .filter((etablissement) => `${etablissement.nom} ${etablissement.sigle ?? ''}`.toLowerCase().includes(terme))
    .map((etablissement) => ({
      id: etablissement.id,
      libelle: etablissement.sigle ?? etablissement.nom,
      detail: etablissement.sigle ? etablissement.nom : undefined,
    }));

  return (
    <ChecklistSelection
      options={options}
      selection={selection}
      libelles={libelles}
      onChange={onChange}
      chargement={isLoading}
      messageVide="Aucun établissement ne correspond à cette recherche."
      recherche={{ valeur: recherche, onChange: setRecherche, placeholder: 'Rechercher un établissement' }}
      erreur={erreur}
    />
  );
}