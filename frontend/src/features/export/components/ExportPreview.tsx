import { AlertCircle, CalendarClock, CheckCircle2, Download, FileArchive, FileSpreadsheet, FileText, LoaderCircle, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ApercuExport, FiltresExport } from '../types/export.types';
import { formaterDateHeure, LIBELLES_FORMAT, LIBELLES_PORTEE, resumeFiltres } from '../lib/export.utils';

interface ExportPreviewProps {
  apercu?: ApercuExport;
  filtres: FiltresExport;
  utilisateur?: string;
  chargement: boolean;
  erreur?: string;
  telechargementEnCours: boolean;
  formulaireValide: boolean;
  onTelecharger: () => void;
}

const LIBELLES_ENTITES = [
  { cle: 'conventions', libelle: 'Conventions' },
  { cle: 'projets', libelle: 'Projets' },
  { cle: 'partenariats', libelle: 'Partenariats' },
  { cle: 'partenaires', libelle: 'Partenaires' },
] as const;

export function ExportPreview({
  apercu,
  filtres,
  utilisateur,
  chargement,
  erreur,
  telechargementEnCours,
  formulaireValide,
  onTelecharger,
}: ExportPreviewProps) {
  const dateApercu = apercu ? formaterDateHeure(apercu.date_apercu) : '—';
  const descriptionFormat = apercu?.formats[filtres.format];
  const fichiersCsv = filtres.format === 'CSV' ? apercu?.formats.CSV : undefined;
  const peutTelecharger =
    formulaireValide &&
    Boolean(apercu) &&
    (apercu?.total_lignes ?? 0) > 0 &&
    !chargement &&
    !telechargementEnCours;
  const nomFormat = LIBELLES_FORMAT[filtres.format];
  const IconeFormat = filtres.format === 'CSV'
    ? FileArchive
    : filtres.format === 'XLSX'
      ? FileSpreadsheet
      : FileText;

  return (
    <aside
      aria-labelledby="export-preview-title"
      className="lg:sticky lg:top-4 lg:self-start"
    >
      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="export-preview-title" className="text-base font-bold text-[var(--color-text-primary)]">
              Aperçu de l’export
            </h2>
            {chargement ? (
              <LoaderCircle aria-label="Mise à jour de l’aperçu" className="size-4 animate-spin text-[var(--color-brand)]" />
            ) : apercu ? (
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <CheckCircle2 aria-hidden="true" className="size-4 text-[var(--color-brand)]" />
                À jour
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {LIBELLES_PORTEE[filtres.portee]}
          </p>
        </header>

        <div className="space-y-5 p-4 sm:p-5">
          {erreur ? (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-[var(--chart-error)]/30 bg-[var(--color-page-bg)] p-3 text-sm text-[var(--color-text-primary)]">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--chart-error)]" />
              <span>{erreur}</span>
            </div>
          ) : null}

          <div aria-live="polite" aria-atomic="true" className="rounded-xl bg-[var(--color-page-bg)] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Total estimé
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--color-brand)]">
              {apercu ? apercu.total_lignes.toLocaleString('fr-FR') : chargement ? '…' : '—'}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {apercu?.total_lignes === 1 ? 'ligne à exporter' : 'lignes à exporter'}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--color-text-primary)]">Détail par entité</h3>
            <dl className="space-y-2">
              {LIBELLES_ENTITES.map(({ cle, libelle }) => {
                const actif = filtres.portee === 'TOUT' || filtres.portee === cle.toUpperCase();
                const total = apercu?.par_entite[cle] ?? 0;
                return (
                  <div key={cle} className={`flex items-center justify-between gap-3 text-sm ${actif ? '' : 'opacity-45'}`}>
                    <dt className="text-[var(--color-text-secondary)]">{libelle}</dt>
                    <dd className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {actif ? (apercu ? total.toLocaleString('fr-FR') : '—') : '—'}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-xs">
            <div className="flex items-start gap-2">
              <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-text-secondary)]" />
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">Filtres appliqués</p>
                <p className="mt-0.5 leading-relaxed text-[var(--color-text-secondary)]">{resumeFiltres(filtres)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
              <span>Prévisualisé le {dateApercu}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              <span className="break-all">{utilisateur ?? 'Compte Présidence'}</span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="flex items-start gap-2">
              <IconeFormat aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-brand)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{nomFormat}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {descriptionFormat?.description ?? 'Le nombre de fichiers sera calculé après validation des filtres.'}
                </p>
                {fichiersCsv ? (
                  <>
                    <p className="mt-2 text-xs font-semibold text-[var(--color-text-primary)]">
                      {fichiersCsv.nombre_fichiers} fichiers dans l’archive
                    </p>
                    <ul className="mt-1 max-h-24 space-y-1 overflow-y-auto text-xs text-[var(--color-text-secondary)]">
                      {fichiersCsv.fichiers.map((fichier) => <li key={fichier}>• {fichier}</li>)}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={onTelecharger}
            disabled={!peutTelecharger}
            className="h-11 w-full gap-2 rounded-lg bg-[var(--color-brand)] text-[var(--color-brand-text)] hover:bg-[var(--color-brand-hover)]"
          >
            {telechargementEnCours ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Download aria-hidden="true" className="size-4" />
            )}
            {telechargementEnCours ? 'Génération en cours…' : 'Télécharger l’export'}
          </Button>
          {apercu && apercu.total_lignes === 0 ? (
            <p className="-mt-2 text-center text-xs text-[var(--color-text-secondary)]">
              Aucune ligne ne correspond aux filtres sélectionnés.
            </p>
          ) : null}
          <p className="flex items-center justify-center gap-1 text-center text-xs text-[var(--color-text-secondary)]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Accès réservé à l’espace Présidence
          </p>
        </div>
      </section>
    </aside>
  );
}
