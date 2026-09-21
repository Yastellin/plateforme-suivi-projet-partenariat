// src/components/layout/TopbarInterne.tsx
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

interface TopbarInterneProps {
  onOuvrirRecherche?: () => void
  onOuvrirNotifications?: () => void
}

export function TopbarInterne({ onOuvrirRecherche, onOuvrirNotifications }: TopbarInterneProps) {
  const { utilisateur } = useAuth()

  return (
    <header
      className="flex items-center justify-between border-b border-border px-6 py-3"
      style={{ height: "var(--layout-topbar-height)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onOuvrirRecherche}
          className="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search size={14} />
          <span>Rechercher...</span>
          <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-data">
            Cmd+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" onClick={onOuvrirNotifications}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
            {utilisateur?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="hidden text-left text-[12px] sm:block">
            <p className="font-medium text-foreground">{utilisateur?.email}</p>
            <p className="text-muted-foreground">{utilisateur?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
