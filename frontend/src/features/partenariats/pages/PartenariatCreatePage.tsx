// src/features/partenariats/pages/PartenariatCreatePage.tsx

import { PartenariatWizard } from '../components/PartenariatWizard';

export function PartenariatCreatePage() {
  return (
    <div>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-bold">Nouveau partenariat</h1>
      </div>
      <PartenariatWizard />
    </div>
  );
}