// src/components/shared/DataTable.tsx
import { useMemo, type ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MetaPagination } from "@/types/api"

export interface Colonne<T> {
  id: string
  header: string
  cell: (ligne: T) => ReactNode
  className?: string
  // Sur mobile, le tableau devient une pile de cartes : la colonne
  // primaire sert de titre de carte, les suivantes de lignes d'information.
  primaire?: boolean
}

interface DataTableProps<T> {
  colonnes: Colonne<T>[]
  donnees: T[]
  meta?: MetaPagination
  onPageChange?: (page: number) => void
  onLigneClick?: (ligne: T) => void
  enChargement?: boolean
}

export function DataTable<T extends { id: string }>({
  colonnes,
  donnees,
  meta,
  onPageChange,
  onLigneClick,
  enChargement,
}: DataTableProps<T>) {
  const plage = useMemo(() => {
    if (!meta || meta.total === 0) return null
    const debut = (meta.page - 1) * meta.limit + 1
    const fin = Math.min(meta.page * meta.limit, meta.total)
    return { debut, fin }
  }, [meta])

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {colonnes.map((colonne) => (
                <TableHead key={colonne.id} className={colonne.className}>
                  {colonne.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enChargement
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {colonnes.map((colonne) => (
                      <TableCell key={colonne.id}>
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : donnees.map((ligne) => (
                  <TableRow
                    key={ligne.id}
                    onClick={onLigneClick ? () => onLigneClick(ligne) : undefined}
                    className={cn(onLigneClick && "cursor-pointer")}
                  >
                    {colonnes.map((colonne) => (
                      <TableCell key={colonne.id} className={colonne.className}>
                        {colonne.cell(ligne)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {enChargement
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))
          : donnees.map((ligne) => (
              <button
                key={ligne.id}
                type="button"
                onClick={onLigneClick ? () => onLigneClick(ligne) : undefined}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 text-left"
              >
                {colonnes.map((colonne) => (
                  <div
                    key={colonne.id}
                    className={cn(
                      "flex items-start justify-between gap-3",
                      colonne.primaire && "font-heading font-semibold"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{colonne.header}</span>
                    <span className={cn("text-right text-sm", colonne.primaire && "text-sm")}>
                      {colonne.cell(ligne)}
                    </span>
                  </div>
                ))}
              </button>
            ))}
      </div>

      {meta && plage && meta.total > 0 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>
            {plage.debut}-{plage.fin} sur {meta.total}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={meta.page <= 1 || !onPageChange}
            onClick={() => onPageChange?.(meta.page - 1)}
            aria-label="Page precedente"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={meta.page >= meta.totalPages || !onPageChange}
            onClick={() => onPageChange?.(meta.page + 1)}
            aria-label="Page suivante"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
