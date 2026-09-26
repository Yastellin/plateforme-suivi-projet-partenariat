// src/components/layout/CommandPalette.tsx

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Handshake, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  ouvert: boolean;
  onFermer: () => void;
}

interface ActionRapide {
  id: string;
  label: string;
  chemin: string;
  icone: typeof LayoutDashboard;
}

const ACTIONS_RAPIDES: ActionRapide[] = [
  { id: 'dashboard', label: 'Tableau de bord', chemin: '/presidence', icone: LayoutDashboard },
  { id: 'partenaires', label: 'Partenaires', chemin: '/presidence/partenaires-partenariats/partenaires', icone: Users },
  { id: 'partenariats', label: 'Partenariats', chemin: '/presidence/partenaires-partenariats/partenariats', icone: Handshake },
  { id: 'conventions', label: 'Conventions', chemin: '/presidence/conventions', icone: FileText },
];

export function CommandPalette({ ouvert, onFermer }: CommandPaletteProps) {
  const [requete, setRequete] = useState('');
  const [indexActif, setIndexActif] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const resultats = ACTIONS_RAPIDES.filter((action) =>
    action.label.toLowerCase().includes(requete.toLowerCase()),
  );

  useEffect(() => {
    if (ouvert) {
      setRequete('');
      setIndexActif(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
  }, [ouvert]);

  useEffect(() => {
    setIndexActif(0);
  }, [requete]);

  if (!ouvert) {
    return null;
  }

  function selectionner(action: ActionRapide) {
    navigate(action.chemin);
    onFermer();
  }

  function gererClavier(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onFermer();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndexActif((i) => Math.min(i + 1, resultats.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndexActif((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && resultats[indexActif]) {
      selectionner(resultats[indexActif]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche globale"
        className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={gererClavier}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-text-secondary)]" />
          <input
            ref={inputRef}
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder="Rechercher un partenaire, une convention, un projet…"
            className="w-full bg-transparent text-[13.5px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
          <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-page-bg)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--color-text-secondary)]">
            Échap
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {resultats.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-[var(--color-text-secondary)]">
              Aucun résultat pour « {requete} ».
            </p>
          ) : (
            resultats.map((action, i) => {
              const Icone = action.icone;
              return (
                <button
                  key={action.id}
                  onClick={() => selectionner(action)}
                  onMouseEnter={() => setIndexActif(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-[13.5px]',
                    i === indexActif
                      ? 'bg-[var(--color-active-zone)] text-[var(--color-brand-deep)]'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  <Icone className="h-4 w-4 flex-shrink-0 opacity-75" />
                  {action.label}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}