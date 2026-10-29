// src/components/forms/wizard/WizardProgressBar.tsx

import { Check } from 'lucide-react';
import './wizard-progress.css';

interface WizardProgressBarProps {
  etapes: string[];
  etapeActive: number;
}

export function WizardProgressBar({ etapes, etapeActive }: WizardProgressBarProps) {
  return (
    <ol
      className="wizard-etapes"
      style={{ gridTemplateColumns: `repeat(${etapes.length}, minmax(0, 1fr))` }}
    >
      {etapes.map((libelle, index) => {
        const etat = index < etapeActive ? 'terminee' : index === etapeActive ? 'active' : 'a-venir';

        return (
          <li
            key={libelle}
            aria-current={etat === 'active' ? 'step' : undefined}
            data-etat={etat}
            className="wizard-etape"
          >
            <span className="wizard-etape__pastille">
              {etat === 'terminee' ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </span>
            <span className="wizard-etape__libelle hidden sm:inline">{libelle}</span>
          </li>
        );
      })}
    </ol>
  );
}
