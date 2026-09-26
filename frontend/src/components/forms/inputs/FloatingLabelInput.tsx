// src/components/forms/inputs/FloatingLabelInput.tsx

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  aide?: string;
  erreur?: string;
  icone?: ReactNode;
  suffixe?: ReactNode;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, aide, erreur, icone, suffixe, className, id, ...props }, ref) => {
    const idGenere = useId();
    const inputId = id ?? idGenere;

    return (
      <div className="mb-4">
        <div className="relative">
          {icone ? (
            <span className="pointer-events-none absolute left-[13px] top-[15px] text-[var(--color-text-secondary)] [&>svg]:h-4 [&>svg]:w-4">
              {icone}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={cn(
              'peer w-full rounded-[var(--radius-sm)] border bg-[var(--color-surface)] pb-2 pt-4 text-[13.5px]',
              'text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow]',
              'border-[var(--color-border)] focus:border-[var(--color-brand)]',
              'focus:shadow-[0_0_0_3px_rgba(54,125,86,0.16)]',
              icone ? 'pl-10' : 'pl-[13px]',
              suffixe ? 'pr-10' : 'pr-[13px]',
              erreur && 'border-[var(--status-expire-fg)]',
              className,
            )}
            aria-invalid={Boolean(erreur)}
            aria-describedby={aide || erreur ? `${inputId}-aide` : undefined}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute left-[13px] top-[14px] bg-[var(--color-surface)] px-1',
              'text-[13.5px] text-[var(--color-text-secondary)] transition-all',
              icone && 'left-10',
              'peer-focus:left-[11px] peer-focus:top-[-8px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-[var(--color-brand)]',
              'peer-[&:not(:placeholder-shown)]:left-[11px] peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold',
            )}
          >
            {label}
          </label>

          {suffixe ? <span className="absolute right-2 top-[10px]">{suffixe}</span> : null}
        </div>

        {erreur ? (
          <p role="alert" id={`${inputId}-aide`} className="mt-1 px-0.5 text-[11.5px] font-medium text-[var(--status-expire-fg)]">
            {erreur}
          </p>
        ) : aide ? (
          <p id={`${inputId}-aide`} className="mt-1 px-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
            {aide}
          </p>
        ) : null}
      </div>
    );
  },
);

FloatingLabelInput.displayName = 'FloatingLabelInput';