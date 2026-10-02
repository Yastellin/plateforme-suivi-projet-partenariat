// src/features/projets/components/ProjetInformations.tsx

import type { ReactNode } from 'react';
import { formaterDate, formaterMontant } from '@/lib/format';
import type { Projet } from '@/types/api';
import { IndicateurAvancement } from './IndicateurAvancement';

interface ProjetInformationsProps {
  projet: Projet;
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-[15px] font-bold">{titre}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
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
    <div className="flex flex-col gap-5">
      <Section titre="Informations générales">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Intitulé officiel">{projet.intitule_officiel ?? 'Non renseigné'}</Champ>
          <Champ libelle="Type">{projet.type}</Champ>
          <Champ libelle="Domaine">{projet.domaine ?? 'Non renseigné'}</Champ>
          <Champ libelle="Budget">{projet.budget !== null ? formaterMontant(projet.budget) : 'Non renseigné'}</Champ>
          <Champ libelle="Période">
            <span className="font-mono text-[12.5px]">
              {formaterDate(projet.date_debut)} au {formaterDate(projet.date_fin_prevue)}
            </span>
          </Champ>
        </dl>
      </Section>

      <Section titre="Avancement">
        <IndicateurAvancement pourcentage={projet.avancement} />
      </Section>
    </div>
  );
}