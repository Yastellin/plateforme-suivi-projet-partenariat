import { useState } from 'react';
import { LoaderCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDemanderModificationProjet } from '@/features/projets/api/useDemandeModificationProjet';

interface DemandeModificationProjetDialogProps {
  ouvert: boolean;
  projetId: string;
  projetNom: string;
  onFermer: () => void;
  onEnvoyee: () => void;
}

export function DemandeModificationProjetDialog({
  ouvert,
  projetId,
  projetNom,
  onFermer,
  onEnvoyee,
}: DemandeModificationProjetDialogProps) {
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const demande = useDemanderModificationProjet(projetId);

  function fermer() {
    if (demande.isPending) return;
    setMotif('');
    setErreur(null);
    onFermer();
  }

  function envoyer() {
    const motifNettoye = motif.trim();
    if (motifNettoye.length < 10) {
      setErreur('Le motif doit contenir au moins 10 caractères.');
      return;
    }

    setErreur(null);
    demande.mutate(motifNettoye, {
      onSuccess: () => {
        toast.success('Demande transmise à la Présidence');
        setMotif('');
        onEnvoyee();
        onFermer();
      },
      onError: (cause: Error) => setErreur(cause.message),
    });
  }

  return (
    <Dialog
      open={ouvert}
      onOpenChange={(prochainEtat) => {
        if (!prochainEtat) fermer();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Demander une modification</DialogTitle>
          <DialogDescription>
            Expliquez la correction nécessaire pour « {projetNom} ». La
            Présidence pourra approuver la réouverture du projet ou rejeter la
            demande.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="motif-demande-modification"
            className="text-[13px] font-semibold text-[var(--color-text-primary)]"
          >
            Motif de la demande
          </label>
          <Textarea
            id="motif-demande-modification"
            value={motif}
            onChange={(evenement) => {
              setMotif(evenement.target.value);
              if (erreur) setErreur(null);
            }}
            rows={6}
            maxLength={1000}
            placeholder="Ex. : Le devis actualisé du fournisseur de Toliara modifie le budget prévisionnel."
            aria-invalid={Boolean(erreur)}
            aria-describedby={
              erreur ? 'erreur-demande-modification' : undefined
            }
            disabled={demande.isPending}
          />
          <div className="flex items-start justify-between gap-3 text-xs">
            <span
              id="erreur-demande-modification"
              className="text-[var(--status-expire-fg)]"
              role={erreur ? 'alert' : undefined}
            >
              {erreur}
            </span>
            <span className="ml-auto font-mono text-[var(--color-text-secondary)]">
              {motif.length}/1000
            </span>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={fermer}
            disabled={demande.isPending}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)] disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={envoyer}
            disabled={demande.isPending}
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
          >
            {demande.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Envoyer la demande
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
