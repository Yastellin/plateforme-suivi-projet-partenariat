// src/components/forms/inputs/DateInput.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
import { FloatingLabelInput } from './FloatingLabelInput';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  aide?: string;
  erreur?: string;
  requis?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ label, aide, erreur, requis, ...props }, ref) => {
  return (
    <FloatingLabelInput
      ref={ref}
      type="date"
      label={label}
      aide={aide}
      erreur={erreur}
      requis={requis}
      icone={<Calendar />}
      libelleRemonte
      {...props}
    />
  );
});

DateInput.displayName = 'DateInput';