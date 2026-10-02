// src/features/tableau-de-bord/pages/TableauDeBordPresidence.tsx

import { Link } from 'react-router-dom';
import { useTableauDeBord } from '../api/useTableauDeBord';
import { useEcheancier } from '../api/useEcheancier';
import { CompteursGlobaux } from '../components/CompteursGlobaux';
import { GraphiqueStatuts } from '../components/GraphiqueStatuts';
import { EcheancierListe } from '../components/EcheancierListe';

export function TableauDeBordPresidence() {
  const { data: tableauDeBord, isLoading: chargementCompteurs } = useTableauDeBord();
  const { data: echeances, isLoading: chargementEcheancier } = useEcheancier();

  const compteurs = tableauDeBord?.compteurs;

  return (
    <div>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-bold">Tableau de bord</h1>
      </div>

      <CompteursGlobaux compteurs={compteurs} chargement={chargementCompteurs} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h3 className="text-[15px] font-bold">Conventions à traiter</h3>
            <Link
              to="/presidence/conventions"
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              Tout voir
            </Link>
          </div>
          <EcheancierListe echeances={echeances} chargement={chargementEcheancier} />
        </section>

        <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h3 className="text-[15px] font-bold">Répartition des conventions</h3>
          </div>
          <div className="p-[18px_20px]">
            <GraphiqueStatuts compteurs={compteurs} chargement={chargementCompteurs} />
          </div>
        </section>
      </div>
    </div>
  );
}