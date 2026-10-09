import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return <section className={`overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] ${className}`}>{children}</section>;
}

interface PanelHeaderProps {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
}

export function PanelHeader({ titre, sousTitre, action }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
      <div>
        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">{titre}</h3>
        {sousTitre ? <p className="mt-1 text-[11.5px] text-[var(--color-text-secondary)]">{sousTitre}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function PanelBody({ children, className = '' }: PanelProps) {
  return <div className={`p-[16px_18px] ${className}`}>{children}</div>;
}
