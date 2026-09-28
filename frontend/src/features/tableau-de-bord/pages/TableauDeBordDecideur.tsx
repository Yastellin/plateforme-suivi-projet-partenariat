// src/features/tableau-de-bord/pages/TableauDeBordDecideur.tsx

import { useTableauDeBord } from '../api/useTableauDeBord';
import { useComparatifEtablissements } from '../api/useComparatifEtablissements';
import { CompteursGlobaux } from '../components/CompteursGlobaux';
import { GraphiqueComparatif } from '../components/GraphiqueComparatif';

export function TableauDeBordDecideur() {
  const { data: compteurs, isLoading: chargementCompteurs } = useTableauDeBord();
  const { data: comparatif, isLoading: chargementComparatif } = useComparatifEtablissements();

  return (
    <div>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-bold">Tableau de bord</h1>
      </div>

      <CompteursGlobaux compteurs={compteurs} chargement={chargementCompteurs} />

      <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h3 className="text-[15px] font-bold">Comparatif par établissement</h3>
        </div>
        <div className="p-[18px_20px]">
          <GraphiqueComparatif donnees={comparatif} chargement={chargementComparatif} />
        </div>
      </section>
    </div>
  );
}