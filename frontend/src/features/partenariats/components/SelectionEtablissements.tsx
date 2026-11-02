// src/features/partenariats/components/SelectionEtablissements.tsx

import { useState } from 'react';
import { ChecklistSelection } from '@/components/forms/ChecklistSelection';
import { useEtablissements } from '@/features/etablissements/api/useEtablissements';
import { LogoEtablissement } from '@/components/shared/LogoEtablissement';

interface SelectionEtablissementsProps {
  selection: string[];
  libelles: Record<string, string>;
  onChange: (ids: string[], libellesAjoutes: Record<string, string>) => void;
  erreur?: string;
}

export function SelectionEtablissements({ selection, libelles, onChange, erreur }: SelectionEtablissementsProps) {
  const [recherche, setRecherche] = useState('');
  const { data: pageEtablissements, isLoading } = useEtablissements();

  const terme = recherche.trim().toLowerCase();
  const etablissements = pageEtablissements?.data ?? [];

  const options = etablissements
    .filter((etablissement) => `${etablissement.nom} ${etablissement.sigle ?? ''}`.toLowerCase().includes(terme))
    .map((etablissement) => ({
      id: etablissement.id,
      libelle: etablissement.sigle ?? etablissement.nom,
      detail: etablissement.sigle ? etablissement.nom : undefined,
      vignette: <LogoEtablissement logoUrl={etablissement.logo_url} nom={etablissement.nom} />,
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