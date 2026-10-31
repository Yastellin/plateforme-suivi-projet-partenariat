import { useState } from 'react';
import { ChevronLeft, ChevronRight, History, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useExportHistory } from '../api/useExportHistory';
import type { HistoriqueExport } from '../types/export.types';
import {
  formaterDateHeure,
  LIBELLES_FORMAT,
  LIBELLES_PORTEE,
  resumeFiltres,
} from '../lib/export.utils';

function filtresHistoriqueTexte(historique: HistoriqueExport): string {
  try {
    return resumeFiltres(historique.filtres);
  } catch {
    return LIBELLES_PORTEE[historique.portee];
  }
}

export function ExportHistory() {
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError } = useExportHistory(page, 10);
  const historiques = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section
      aria-labelledby="export-history-title"
      className="mt-7 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-page-bg)] text-[var(--color-brand)]">
            <History aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="export-history-title" className="text-base font-bold text-[var(--color-text-primary)]">
              Historique des exports
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Exports réussis, triés du plus récent au plus ancien.
            </p>
          </div>
        </div>
        {isFetching && !isPending ? (
          <span className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]" aria-live="polite">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Actualisation
          </span>
        ) : null}
      </div>

      {isError ? (
        <div role="alert" className="p-5 text-sm text-[var(--chart-error)]">
          Impossible de charger l’historique des exports. Actualisez la page pour réessayer.
        </div>
      ) : isPending ? (
        <div className="flex items-center gap-2 p-5 text-sm text-[var(--color-text-secondary)]" aria-live="polite">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Chargement de l’historique…
        </div>
      ) : historiques.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-semibold text-[var(--color-text-primary)]">Aucun export pour le moment</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Chaque téléchargement réussi apparaîtra ici.
          </p>
        </div>
      ) : (
        <>
          <Table>
            <caption className="sr-only">Historique paginé des exports téléchargés</caption>
            <TableHeader>
              <TableRow className="bg-[var(--color-page-bg)] hover:bg-[var(--color-page-bg)]">
                <TableHead>Date et heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Portée et filtres</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Lignes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historiques.map((historique) => (
                <TableRow key={historique.id}>
                  <TableCell className="text-[var(--color-text-primary)]">
                    {formaterDateHeure(historique.date_creation)}
                  </TableCell>
                  <TableCell className="max-w-48 break-all text-[var(--color-text-secondary)]">
                    {historique.utilisateur}
                  </TableCell>
                  <TableCell className="min-w-56 max-w-96 whitespace-normal text-[var(--color-text-secondary)]">
                    {filtresHistoriqueTexte(historique)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-[var(--color-page-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                      {LIBELLES_FORMAT[historique.format]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {historique.nombre_lignes.toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
            <p className="text-xs text-[var(--color-text-secondary)]" aria-live="polite">
              {meta?.total ?? 0} export{meta?.total === 1 ? '' : 's'} au total
              {meta?.totalPages ? ` · Page ${meta.page} sur ${meta.totalPages}` : ''}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((actuelle) => Math.max(1, actuelle - 1))}
                disabled={!meta || page <= 1 || isFetching}
                aria-label="Page précédente de l’historique"
              >
                <ChevronLeft aria-hidden="true" /> Précédent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((actuelle) => Math.min(meta?.totalPages ?? actuelle, actuelle + 1))}
                disabled={!meta || page >= meta.totalPages || isFetching}
                aria-label="Page suivante de l’historique"
              >
                Suivant <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
