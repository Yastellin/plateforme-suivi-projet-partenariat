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
  onCreerPartenaire?: (nom: string) => void;
}

export function SelectionPartenaires({ selection, libelles, onChange, erreur, onCreerPartenaire }: SelectionPartenairesProps) {
  const [recherche, setRecherche] = useState('');
  const rechercheDifferee = useDebounce(recherche, 300);
  const { data, isLoading } = usePartenaires({ page: 1, limit: LIMITE_OPTIONS, recherche: rechercheDifferee });

  const options = (data?.data ?? []).map((partenaire) => ({
    id: partenaire.id,
    libelle: partenaire.nom,
    detail: `${partenaire.type}, ${partenaire.pays}`,
  }));

  const nomSaisi = recherche.trim();
  const peutCreer = Boolean(
    onCreerPartenaire &&
      nomSaisi &&
      rechercheDifferee.trim() === nomSaisi &&
      !isLoading &&
      options.length === 0,
  );

  return (
    <div className="flex flex-col gap-3">
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
      {peutCreer ? (
        <button
          type="button"
          onClick={() => onCreerPartenaire?.(nomSaisi)}
          className="self-start rounded-[var(--radius-sm)] border border-[var(--color-brand)] px-3.5 py-2 text-left text-[13px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-chrome-hover)]"
        >
          Créer un nouveau partenaire : “{nomSaisi}”
        </button>
      ) : null}
    </div>
  );
}