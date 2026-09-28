// src/components/forms/inputs/DateInput.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
import { FloatingLabelInput } from './FloatingLabelInput';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  aide?: string;
  erreur?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ label, aide, erreur, ...props }, ref) => {
  return (
    <FloatingLabelInput
      ref={ref}
      type="date"
      label={label}
      aide={aide}
      erreur={erreur}
      icone={<Calendar />}
      libelleRemonte
      {...props}
    />
  );
});

DateInput.displayName = 'DateInput';