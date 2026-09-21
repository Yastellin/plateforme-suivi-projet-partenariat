// src/components/shared/StatusStrip.tsx
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusStripItem {
  icon: LucideIcon
  titre: string
  description: string
  variante?: "default" | "attente" | "succes" | "alerte"
}

interface StatusStripProps {
  items: StatusStripItem[]
  className?: string
}

const VARIANTE_ICON_CLASSES: Record<NonNullable<StatusStripItem["variante"]>, string> = {
  default: "bg-muted text-muted-foreground",
  attente: "bg-statut-attente-fg/15 text-statut-attente-fg",
  succes: "bg-statut-actif-fg/15 text-statut-actif-fg",
  alerte: "bg-statut-expire-fg/15 text-statut-expire-fg",
}

export function StatusStrip({ items, className }: StatusStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-[20px] rounded-[var(--radius)] border border-border bg-surface p-[18px_20px] sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => {
        const variante = item.variante ?? "default"
        const Icon = item.icon

        return (
          <div key={i} className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                VARIANTE_ICON_CLASSES[variante],
              )}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{item.titre}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
