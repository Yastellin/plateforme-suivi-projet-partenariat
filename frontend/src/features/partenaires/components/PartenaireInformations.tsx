// src/features/partenaires/components/PartenaireInformations.tsx

import type { Partenaire } from '@/types/api';

interface PartenaireInformationsProps {
  partenaire: Partenaire;
}

interface LigneInformation {
  libelle: string;
  valeur: string;
}

export function PartenaireInformations({ partenaire }: PartenaireInformationsProps) {
  const lignes: LigneInformation[] = [
    { libelle: 'Type', valeur: partenaire.type },
    { libelle: 'Pays', valeur: partenaire.pays },
    { libelle: 'Adresse', valeur: partenaire.adresse ?? '—' },
    { libelle: 'Visibilité', valeur: partenaire.visibilite === 'PUBLIC' ? 'Publique' : 'Privée' },
    { libelle: 'Partenaire stratégique', valeur: partenaire.est_strategique ? 'Oui' : 'Non' },
    { libelle: 'Description', valeur: partenaire.description ?? '—' },
  ];

  return (
    <dl className="flex flex-col gap-4">
      {lignes.map((ligne) => (
        <div key={ligne.libelle}>
          <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {ligne.libelle}
          </dt>
          <dd className="mt-1 text-[13.5px]">{ligne.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}