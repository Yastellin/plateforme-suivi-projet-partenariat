// src/components/shared/TablePagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TablePaginationProps {
  page: number
  totalPages: number
  limite: number
  total: number
  onChangePage: (page: number) => void
  onChangeLimite: (limite: number) => void
}

export function TablePagination({
  page,
  totalPages,
  limite,
  total,
  onChangePage,
  onChangeLimite,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>
          {total} resultats
        </span>
        <select
          value={limite}
          onChange={(e) => {
            onChangeLimite(Number(e.target.value))
            onChangePage(1)
          }}
          className="rounded-[var(--radius-sm)] border border-input bg-surface px-2 py-1 text-[12px] font-medium text-foreground"
        >
          {[10, 25, 50, 100].map((v) => (
            <option key={v} value={v}>
              {v} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="px-2 text-[12px] font-data tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
