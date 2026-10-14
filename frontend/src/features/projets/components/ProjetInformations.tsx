// src/features/projets/components/ProjetInformations.tsx

import type { ReactNode } from 'react';
import { formaterDate, formaterMontant } from '@/lib/format';
import type { Projet } from '@/types/api';

interface ProjetInformationsProps {
  projet: Projet;
}

function Champ({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{libelle}</dt>
      <dd className="mt-1 text-[13.5px]">{children}</dd>
    </div>
  );
}

export function ProjetInformations({ projet }: ProjetInformationsProps) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Champ libelle="Intitulé officiel">{projet.intitule_officiel ?? 'Non renseigné'}</Champ>
      <Champ libelle="Type">{projet.type}</Champ>
      <Champ libelle="Domaine">{projet.domaine ?? 'Non renseigné'}</Champ>
      <Champ libelle="Budget">{projet.budget !== null ? formaterMontant(projet.budget) : 'Non renseigné'}</Champ>
      <Champ libelle="Date de début">
        <span className="font-mono text-[12.5px]">{formaterDate(projet.date_debut)}</span>
      </Champ>
      <Champ libelle="Date de fin prévue">
        <span className="font-mono text-[12.5px]">{formaterDate(projet.date_fin_prevue)}</span>
      </Champ>
      <Champ libelle="Créé le">
        <span className="font-mono text-[12.5px]">{formaterDate(projet.created_at)}</span>
      </Champ>
    </dl>
  );
}
