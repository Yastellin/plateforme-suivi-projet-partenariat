// src/components/forms/inputs/PasswordInput.tsx

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { FloatingLabelInput } from './FloatingLabelInput';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  aide?: string;
  erreur?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Mot de passe', aide, erreur, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <FloatingLabelInput
        ref={ref}
        type={visible ? 'text' : 'password'}
        label={label}
        aide={aide}
        erreur={erreur}
        icone={<Lock />}
        autoComplete="current-password"
        suffixe={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';