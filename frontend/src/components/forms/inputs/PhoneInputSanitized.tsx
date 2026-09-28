// src/components/forms/inputs/PhoneInputSanitized.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Phone } from 'lucide-react';
import { FloatingLabelInput } from './FloatingLabelInput';

interface PhoneInputSanitizedProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  aide?: string;
  erreur?: string;
}

export const PhoneInputSanitized = forwardRef<HTMLInputElement, PhoneInputSanitizedProps>(
  ({ label = 'Téléphone', aide, erreur, onChange, ...props }, ref) => {
    function gererSaisie(e: React.ChangeEvent<HTMLInputElement>) {
      let valeur = e.target.value;

      valeur = valeur.replace(/[^\d+\s]/g, '');

      if (valeur.indexOf('+') > 0) {
        valeur = valeur.replace(/\+/g, '');
      }

      const parties = valeur.split('+');
      if (parties.length > 2) {
        valeur = '+' + parties.slice(1).join('');
      }

      e.target.value = valeur;
      onChange?.(e);
    }

    return (
      <FloatingLabelInput
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={label}
        aide={aide ?? 'Format : +261 32 12 345 67 ou 032 12 345 67'}
        erreur={erreur}
        icone={<Phone />}
        placeholder="032 12 345 67"
        onChange={gererSaisie}
        {...props}
      />
    );
  },
);

PhoneInputSanitized.displayName = 'PhoneInputSanitized';