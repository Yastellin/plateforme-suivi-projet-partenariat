// src/components/forms/inputs/FloatingLabelInput.tsx
import { forwardRef, useState, useId } from "react"
import { cn } from "@/lib/utils"

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  aide?: string
  erreur?: string
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, aide, erreur, className, id: idProp, type, ...props }, ref) => {
    const autoId = useId()
    const id = idProp ?? autoId
    const [estActive, setEstActive] = useState(false)
    const [aLaFiche, setALaFiche] = useState(false)
    const [estVisible, setEstVisible] = useState(type !== "password")

    const valeurRemplie = Boolean(props.value) || Boolean(props.defaultValue)

    const montreLabel = estActive || aLaFiche || valeurRemplie

    return (
      <div className="relative">
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={type === "password" ? (estVisible ? "text" : "password") : type}
            className={cn(
              "peer w-full rounded-[var(--radius-sm)] border border-input bg-surface px-[13px] pt-[10px] pb-[10px]",
              "text-[13px] font-medium text-foreground",
              "placeholder-transparent",
              "transition-shadow",
              "focus:border-primary focus:ring-[0_0_0_3px] focus:ring-primary/18 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              erreur && "border-destructive focus:border-destructive focus:ring-destructive/18",
              className,
            )}
            placeholder={label ?? props.placeholder}
            onFocus={(e) => {
              setEstActive(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setEstActive(false)
              setALaFiche(true)
              props.onBlur?.(e)
            }}
            onMouseDown={() => setALaFiche(true)}
            onMouseUp={() => setALaFiche(false)}
            onPointerDown={() => setALaFiche(true)}
            onPointerUp={() => setALaFiche(false)}
            aria-describedby={aide ? `${id}-aide` : erreur ? `${id}-erreur` : undefined}
            aria-invalid={Boolean(erreur)}
            {...props}
          />

          {label && (
            <label
              htmlFor={id}
              className={cn(
                "pointer-events-none absolute left-[13px] text-muted-foreground",
                "transition-all duration-150",
                montreLabel
                  ? "top-[5px] text-[11px]"
                  : "top-[10px] text-[13px]",
                montreLabel && "text-primary",
                erreur && montreLabel && "text-destructive",
              )}
            >
              {label}
            </label>
          )}

          {type === "password" && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setEstVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={estVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {estVisible ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {aide && !erreur && (
          <p id={`${id}-aide`} className="mt-1 text-[12px] text-muted-foreground">
            {aide}
          </p>
        )}

        {erreur && (
          <p id={`${id}-erreur`} className="mt-1 text-[12px] text-destructive" role="alert">
            {erreur}
          </p>
        )}
      </div>
    )
  },
)

FloatingLabelInput.displayName = "FloatingLabelInput"
