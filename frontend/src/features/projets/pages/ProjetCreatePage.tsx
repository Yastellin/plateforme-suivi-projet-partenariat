// src/features/projets/pages/ProjetCreatePage.tsx

import { useNavigate } from 'react-router-dom';
import { ProjetWizard } from '../components/ProjetWizard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useEtablissements } from '@/features/etablissements/api/useEtablissements';

export function ProjetCreatePage() {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { estPresidence } = usePermissions();

  const cheminBase = utilisateur?.role === 'PRESIDENCE' ? '/presidence' : '/etablissement';
  const { data: etablissements } = useEtablissements({ page: 1, limit: 100 });

  function onSucces() {
    navigate(`${cheminBase}/projets`);
  }

  return (
    <div>
      <PageHeader
        titre="Nouveau projet"
        description="Créez un projet en suivant les étapes du formulaire."
      />

      <Panel>
        <PanelBody>
          <ProjetWizard
            onSucces={onSucces}
            onAnnuler={() => navigate(`${cheminBase}/projets`)}
            etablissements={estPresidence ? (etablissements?.data ?? []) : undefined}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}
