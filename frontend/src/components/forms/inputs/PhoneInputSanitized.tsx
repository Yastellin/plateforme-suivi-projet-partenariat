// src/components/forms/inputs/PhoneInputSanitized.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Phone } from 'lucide-react';
import { FloatingLabelInput } from './FloatingLabelInput';

interface PhoneInputSanitizedProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  aide?: string;
  erreur?: string;
}

const CARACTERES_INTERDITS = /[^\d+\s\-()]/g;

export const PhoneInputSanitized = forwardRef<HTMLInputElement, PhoneInputSanitizedProps>(
  ({ label = 'Téléphone', aide, erreur, onChange, ...props }, ref) => {
    function gererSaisie(e: React.ChangeEvent<HTMLInputElement>) {
      e.target.value = e.target.value.replace(CARACTERES_INTERDITS, '');
      onChange?.(e);
    }

    return (
      <FloatingLabelInput
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={label}
        aide={aide ?? 'Exemples : +261 32 12 345 67, 032 12 345 67'}
        erreur={erreur}
        icone={<Phone />}
        placeholder="+261 32 12 345 67"
        onChange={gererSaisie}
        {...props}
      />
    );
  },
);

PhoneInputSanitized.displayName = 'PhoneInputSanitized';