// src/components/forms/wizard/WizardProgressBar.tsx

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressBarProps {
  etapes: string[];
  etapeActive: number;
}

export function WizardProgressBar({ etapes, etapeActive }: WizardProgressBarProps) {
  return (
    <ol className="mb-6 flex items-center">
      {etapes.map((libelle, index) => {
        const terminee = index < etapeActive;
        const active = index === etapeActive;
        const estDerniere = index === etapes.length - 1;

        return (
          <li
            key={libelle}
            aria-current={active ? 'step' : undefined}
            className={cn('flex items-center', !estDerniere && 'flex-1')}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full border text-[12px] font-bold',
                  terminee && 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white',
                  active && 'border-[var(--color-brand)] bg-[var(--color-active-zone)] text-[var(--color-brand-deep)]',
                  !terminee && !active && 'border-[var(--color-border)] text-[var(--color-text-secondary)]',
                )}
              >
                {terminee ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-[12.5px] font-semibold sm:inline',
                  active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                )}
              >
                {libelle}
              </span>
            </div>
            {!estDerniere ? (
              <span className={cn('mx-3 h-px flex-1', terminee ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]')} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}