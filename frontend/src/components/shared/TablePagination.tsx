// src/components/shared/TablePagination.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MetaPagination } from '@/types/api';

interface TablePaginationProps {
  meta: MetaPagination;
  onChangerPage: (page: number) => void;
}

export function TablePagination({ meta, onChangerPage }: TablePaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const debut = (meta.page - 1) * meta.limit + 1;
  const fin = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-[12.5px] text-[var(--color-text-secondary)]">
      <span>
        {debut}–{fin} sur {meta.total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChangerPage(meta.page - 1)}
          disabled={meta.page <= 1}
          aria-label="Page précédente"
          className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[70px] text-center font-mono">
          {meta.page} / {meta.totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChangerPage(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          aria-label="Page suivante"
          className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}