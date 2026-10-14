// src/features/partenariats/pages/PartenariatCreatePage.tsx

import { PartenariatWizard } from '../components/PartenariatWizard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Panel, PanelBody } from '@/components/shared/Panel';

export function PartenariatCreatePage() {
  return (
    <div>
      <PageHeader
        titre="Nouveau partenariat"
        description="Créez un partenariat en suivant les étapes du formulaire."
      />

      <Panel>
        <PanelBody>
          <PartenariatWizard />
        </PanelBody>
      </Panel>
    </div>
  );
}
