// src/features/tableau-de-bord/pages/TableauDeBordEtablissement.tsx
<<<<<<< Updated upstream
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

// Tableau de bord limite au perimetre de l'etablissement (section 5 du prompt).
export function TableauDeBordEtablissement() {
  const { utilisateur, deconnecter } = useAuth()

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-semibold">Bienvenue, {utilisateur?.email}</h1>
      <p className="text-sm text-muted-foreground">
        Votre tableau de bord sera complete dans une prochaine etape.
      </p>
      <div>
        <Button onClick={deconnecter} variant="outline">
          Se deconnecter
        </Button>
      </div>
    </div>
  )
=======

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
>>>>>>> Stashed changes
}