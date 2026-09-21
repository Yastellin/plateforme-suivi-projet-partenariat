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
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MetaPagination } from "@/types/api"

export interface Colonne<T> {
  id: string
  header: string
  cell: (ligne: T) => ReactNode
  className?: string
  primaire?: boolean
  triable?: boolean
}

export type DensiteTable = "compact" | "confortable"

interface DataTableProps<T> {
  colonnes: Colonne<T>[]
  donnees: T[]
  meta?: MetaPagination
  onPageChange?: (page: number) => void
  onLigneClick?: (ligne: T) => void
  enChargement?: boolean
  colonnesVisibles?: string[]
  onColonnesChange?: (colonnes: string[]) => void
  densite?: DensiteTable
  onDensiteChange?: (densite: DensiteTable) => void
  selection?: string[]
  onSelectionChange?: (selection: string[]) => void
  tri?: { colonne: string; direction: "asc" | "desc" }
  onTriChange?: (tri: { colonne: string; direction: "asc" | "desc" }) => void
}

export function DataTable<T extends { id: string }>({
  colonnes,
  donnees,
  meta,
  onPageChange,
  onLigneClick,
  enChargement,
  colonnesVisibles,
  onColonnesChange,
  densite = "confortable",
  onDensiteChange,
  selection = [],
  onSelectionChange,
  tri,
  onTriChange,
}: DataTableProps<T>) {
  const colonnesFiltrees = colonnesVisibles ? colonnes.filter((c) => colonnesVisibles.includes(c.id)) : colonnes
  const plage = useMemo(() => {
    if (!meta || meta.total === 0) return null
    const debut = (meta.page - 1) * meta.limit + 1
    const fin = Math.min(meta.page * meta.limit, meta.total)
    return { debut, fin }
  }, [meta])

  const estCompact = densite === "compact"

  return (
    <div className="flex flex-col gap-3">
      {(onColonnesChange || onDensiteChange) && (
        <div className="flex items-center gap-2">
          {onDensiteChange && (
            <div className="flex rounded-lg border border-border">
              <button onClick={() => onDensiteChange("compact")} className={cn("px-2 py-1 text-[11px] font-medium", estCompact && "bg-primary text-primary-foreground rounded-l-lg")}>Compact</button>
              <button onClick={() => onDensiteChange("confortable")} className={cn("px-2 py-1 text-[11px] font-medium", !estCompact && "bg-primary text-primary-foreground rounded-r-lg")}>Confortable</button>
            </div>
          )}
          {onColonnesChange && (
            <div className="flex items-center gap-1">
              {colonnes.map((col) => (
                <button key={col.id} onClick={() => {
                  const visibles = colonnesVisibles ?? colonnes.map((c) => c.id)
                  onColonnesChange(visibles.includes(col.id) ? visibles.filter((v) => v !== col.id) : [...visibles, col.id])
                }} className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors", (colonnesVisibles ?? colonnes.map((c) => c.id)).includes(col.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                  {col.header}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selection.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-[12px] text-primary">
          <span className="font-medium">{selection.length} selectionne{selection.length > 1 ? "s" : ""}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-[11px]" onClick={() => onSelectionChange?.([])}>Effacer</Button>
        </div>
      )}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {onSelectionChange && (
                <TableHead className="w-10">
                  <input type="checkbox" className="h-4 w-4" checked={selection.length === donnees.length && donnees.length > 0} onChange={(e) => onSelectionChange(e.target.checked ? donnees.map((d) => d.id) : [])} />
                </TableHead>
              )}
              {colonnesFiltrees.map((colonne) => (
                <TableHead
                  key={colonne.id}
                  className={cn(colonne.className, colonne.triable && onTriChange && "cursor-pointer select-none hover:bg-muted/80")}
                  onClick={colonne.triable && onTriChange ? () => {
                    const memeColonne = tri?.colonne === colonne.id
                    onTriChange({ colonne: colonne.id, direction: memeColonne && tri?.direction === "asc" ? "desc" : "asc" })
                  } : undefined}
                >
                  <span className="flex items-center gap-1">
                    {colonne.header}
                    {colonne.triable && onTriChange && (
                      tri?.colonne === colonne.id ? (
                        tri.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="text-muted-foreground/50" />
                      )
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enChargement
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {onSelectionChange && <TableCell className="w-10"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></TableCell>}
                    {colonnesFiltrees.map((colonne) => (
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
                    className={cn(onLigneClick && "cursor-pointer", estCompact && "text-[12px]")}
                  >
                    {onSelectionChange && (
                      <TableCell className="w-10">
                        <input type="checkbox" className="h-4 w-4" checked={selection.includes(ligne.id)} onChange={(e) => {
                          e.stopPropagation()
                          onSelectionChange(selection.includes(ligne.id) ? selection.filter((s) => s !== ligne.id) : [...selection, ligne.id])
                        }} />
                      </TableCell>
                    )}
                    {colonnesFiltrees.map((colonne) => (
                      <TableCell key={colonne.id} className={cn(colonne.className, estCompact && "py-1.5")}>
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
