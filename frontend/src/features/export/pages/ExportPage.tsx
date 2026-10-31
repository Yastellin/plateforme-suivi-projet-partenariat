import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { ExportFilters } from '../components/ExportFilters';
import { ExportPreview } from '../components/ExportPreview';
import { ExportHistory } from '../components/ExportHistory';
import { useExportDownload } from '../api/useExportDownload';
import { useExportPreview } from '../api/useExportPreview';
import { filtresExportSchema, STATUTS_EXPORT } from '../types/export.types';
import type { FiltresExport } from '../types/export.types';

function creerFiltresParDefaut(): FiltresExport {
  const maintenant = new Date();
  return {
    portee: 'TOUT',
    periode: {
      mode: 'ANNEE',
      champ_date: 'DEBUT',
      annee: maintenant.getFullYear(),
      mois: maintenant.getMonth(),
      du: '',
      au: '',
    },
    statuts: [...STATUTS_EXPORT],
    format: 'XLSX',
  };
}

export function ExportPage() {
  const { utilisateur } = useAuth();
  const formulaire = useForm<FiltresExport>({
    resolver: zodResolver(filtresExportSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: creerFiltresParDefaut(),
  });
  const valeurs = useWatch({ control: formulaire.control }) as FiltresExport;
  const valeursDifferees = useDebounce(valeurs, 350);
  const formulaireValide = formulaire.formState.isValid;
  const filtresStables =
    formulaireValide && JSON.stringify(valeursDifferees) === JSON.stringify(valeurs);
  const apercuQuery = useExportPreview(valeursDifferees, filtresStables);
  const telechargement = useExportDownload();

  const validerFormulaire = formulaire.trigger;
  useEffect(() => {
    void validerFormulaire();
  }, [validerFormulaire]);

  const erreurApercu = apercuQuery.error instanceof Error
    ? apercuQuery.error.message
    : undefined;

  return (
    <div className="pb-8">
      <PageHeader
        titre="Export des données"
        description="Filtrez les données institutionnelles, vérifiez l’aperçu, puis téléchargez un rapport."
      />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm shadow-[var(--shadow-sm)]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-brand)]" />
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">Espace réservé à la Présidence</p>
          <p className="mt-1 leading-relaxed text-[var(--color-text-secondary)]">
            Les fichiers sont générés à la demande. Les téléchargements réussis sont consignés dans l’historique ci-dessous. Les éléments archivés ne sont pas exportés.
          </p>
        </div>
      </div>

      <FormProvider {...formulaire}>
        <form onSubmit={(event) => event.preventDefault()} noValidate>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <ExportFilters />
            <ExportPreview
              apercu={apercuQuery.isError ? undefined : apercuQuery.data}
              filtres={valeurs}
              utilisateur={utilisateur?.email}
              chargement={apercuQuery.isFetching || !filtresStables}
              erreur={erreurApercu}
              telechargementEnCours={telechargement.isPending}
              formulaireValide={formulaireValide && filtresStables}
              onTelecharger={() => telechargement.mutate(valeurs)}
            />
          </div>
        </form>
      </FormProvider>

      <ExportHistory />

      <p className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <FileDown aria-hidden="true" className="size-4" />
        Les téléchargements CSV sont fournis en archive ZIP avec un fichier d’informations et un fichier par entité.
      </p>
    </div>
  );
}
