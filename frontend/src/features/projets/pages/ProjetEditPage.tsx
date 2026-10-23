// src/features/projets/pages/ProjetEditPage.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { ProjetForm } from '../components/ProjetForm';
import { useProjet } from '../api/useProjet';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { peutModifierProjet } from '@/features/projets/lib/permissions-projet';
import type { Projet } from '@/types/api';

export function ProjetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();

  const cheminBase = utilisateur?.role === 'PRESIDENCE' ? '/presidence' : '/etablissement';

  const { data: projet, isLoading } = useProjet(id ?? '');

  function onSucces(projetModifie: Projet) {
    navigate(`${cheminBase}/projets/${projetModifie.id}`);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  if (!projet) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Projet introuvable.</p>;
  }

  if (!peutModifierProjet(projet, utilisateur?.role)) {
    return (
      <div>
        <PageHeader
          titre={projet.nom}
          description="Modification non autorisée"
        />
        <Panel>
          <PanelBody>
            <p className="text-[13.5px] text-[var(--color-text-secondary)]">
              {utilisateur?.role === 'PRESIDENCE'
                ? "La Présidence ne peut modifier que les projets qu'elle a créés. Les données transmises par un établissement restent protégées."
                : "Un projet d'établissement n'est plus modifiable après sa soumission."}
            </p>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titre={`Modifier — ${projet.nom}`}
        description="Mettez à jour les informations du projet."
      />

      <Panel>
        <PanelBody>
          <ProjetForm projet={projet} onSucces={onSucces} onAnnuler={() => navigate(`${cheminBase}/projets/${projet.id}`)} />
        </PanelBody>
      </Panel>
    </div>
  );
}
