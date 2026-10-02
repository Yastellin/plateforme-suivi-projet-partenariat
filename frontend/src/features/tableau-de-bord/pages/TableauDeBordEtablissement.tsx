// src/features/tableau-de-bord/pages/TableauDeBordEtablissement.tsx
import { Link } from 'react-router-dom';
import { Handshake, FolderKanban } from 'lucide-react';
import { useTableauDeBord } from '../api/useTableauDeBord';
import { CompteursEtablissement } from '../components/CompteursEtablissement';

export function TableauDeBordEtablissement() {
  const { data: compteurs, isLoading } = useTableauDeBord();

  return (
    <div>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-bold">Tableau de bord</h1>
      </div>

      <CompteursEtablissement compteurs={compteurs} chargement={isLoading} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          to="/etablissement/partenaires-partenariats/partenaires"
          className="flex items-center gap-3.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] hover:border-[var(--color-brand)]"
        >
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-active-zone)] text-[var(--color-brand-deep)]">
            <Handshake className="h-[18px] w-[18px]" />
          </div>
          <div>
            <strong className="block text-[13.5px] font-bold">Mes partenaires</strong>
            <span className="text-xs text-[var(--color-text-secondary)]">Consulter et gérer vos partenaires</span>
          </div>
        </Link>

        <Link
          to="/etablissement/projets"
          className="flex items-center gap-3.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] hover:border-[var(--color-brand)]"
        >
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-active-zone)] text-[var(--color-brand-deep)]">
            <FolderKanban className="h-[18px] w-[18px]" />
          </div>
          <div>
            <strong className="block text-[13.5px] font-bold">Mes projets</strong>
            <span className="text-xs text-[var(--color-text-secondary)]">Consulter et gérer vos projets</span>
          </div>
        </Link>
      </div>
    </div>
  );
}