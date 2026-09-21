// src/components/shared/TableToolbar.tsx
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FiltreChip {
  id: string
  label: string
  valeur?: string
  compteur?: number
}

interface TableToolbarProps {
  valeurRecherche: string
  onRechercheChange: (valeur: string) => void
  placeholderRecherche?: string
  filtresActifs?: FiltreChip[]
  onRetirerFiltre?: (id: string) => void
  children?: React.ReactNode
  className?: string
}

export function TableToolbar({
  valeurRecherche,
  onRechercheChange,
  placeholderRecherche = "Rechercher...",
  filtresActifs = [],
  onRetirerFiltre,
  children,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        "px-[20px] py-[13px]",
        className,
      )}
    >
      <div className="relative flex-1 sm:max-w-sm">
        <Input
          value={valeurRecherche}
          onChange={(e) => onRechercheChange(e.target.value)}
          placeholder={placeholderRecherche}
          className="h-9 pl-9 text-[13px]"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {valeurRecherche && (
          <button
            onClick={() => onRechercheChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filtresActifs.map((filtre) => (
          <Badge
            key={filtre.id}
            variant="outline"
            className="gap-1 pr-1 text-[12px]"
          >
            {filtre.label}
            {filtre.compteur !== undefined && (
              <span className="font-data ml-1 text-[11px] text-muted-foreground">
                {filtre.compteur}
              </span>
            )}
            {onRetirerFiltre && (
              <button
                onClick={() => onRetirerFiltre(filtre.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <X size={12} />
              </button>
            )}
          </Badge>
        ))}
        {children}
      </div>
    </div>
  )
}
