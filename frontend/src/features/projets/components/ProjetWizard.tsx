// src/features/projets/components/ProjetWizard.tsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardProgressBar } from "@/components/forms/wizard/WizardProgressBar";
import { SelectionPorteur } from "@/features/projets/components/SelectionPorteur";
import { SelectionBailleurs } from "@/features/projets/components/SelectionBailleurs";
import { SelectionBeneficiaires } from "@/features/projets/components/SelectionBeneficiaires";
import { SelectionSites } from "@/features/projets/components/SelectionSites";
import { useCreateProjet } from "@/features/projets/api/useCreateProjet";
import { DocumentDropzone, type DocumentEnAttente } from "@/features/documents/components/DocumentDropzone";
import { useUploadDocument } from "@/features/documents/api/useUploadDocument";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import { useWizardDraft } from "@/components/forms/wizard/useWizardDraft";
import {
  creerSchemaProjet,
  type ProjetFormValues,
} from "@/lib/validators/projet.schema";
import { jourCourant } from "@/lib/validators/regles-dates";
import type { PorteurFormValue } from "@/lib/validators/projet.schema";
import type { Projet } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

interface ProjetWizardProps {
  onSucces: (projet: Projet) => void;
  onAnnuler: () => void;
}

const STATUTS = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_COURS", label: "En cours" },
  { value: "SUSPENDU", label: "Suspendu" },
  { value: "EXPIRE", label: "Expire" },
  { value: "TERMINE", label: "Termine" },
];

const ETAPES = [
  "Informations",
  "Dates & statut",
  "Porteur",
  "Referentiels",
  "Recapitulatif",
];

// Wizard multi-etapes pour la creation d'un projet (section 7.2 :
// "wizard de creation"). L'etablissement cree toujours en BROUILLON
// (section 5). Etapes numerotees, barre de progression, recapitulatif.
export function ProjetWizard({ onSucces, onAnnuler }: ProjetWizardProps) {
  const [etapeActive, setEtapeActive] = useState(0);
  const [documentsEnAttente, setDocumentsEnAttente] = useState<DocumentEnAttente[]>([]);
  const creation = useCreateProjet();
  const uploadDocument = useUploadDocument();
  const { utilisateur } = useAuth();
  const estPresidence = utilisateur?.role === "PRESIDENCE";
  const aujourdHui = jourCourant();
  // Liste complete des etablissements : alimente l'etape 3 (etablissement
  // responsable facultatif) et le recapitulatif (une seule requete, cache partage).
  const { data: pageEtablissements } = useEtablissements({
    page: 1,
    limit: 100,
  });
  const etablissements = pageEtablissements?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ProjetFormValues>({
    resolver: zodResolver(
      creerSchemaProjet({ exigerDateDebutFuture: true }),
    ) as any,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: "",
      intitule_officiel: "",
      type: "",
      domaine: "",
      budget: undefined,
      date_debut: "",
      date_fin_prevue: "",
      statut: "BROUILLON",
      etablissement_id: "",
      // Porteur obligatoire : on arrive sur l'etape 3 avec le formulaire
      // "nouveau porteur" deja affiche (champs visibles immediatement).
      porteur: {
        mode: "nouveau",
        type_porteur: "PERSONNE",
        nom: "",
        institution_rattachement: "",
      },
      bailleurs_ids: [],
      beneficiaires_ids: [],
      sites_ids: [],
    },
  });

  const valeurs = watch();
  const dateDebut = watch("date_debut");
  const dateFin = watch("date_fin_prevue");
  const derniereEtape = etapeActive === ETAPES.length - 1;

  // Les erreurs de dates croisees (fin <= debut) sont rattachees au champ
  // date_fin_prevue, or React Hook Form ne revalide que le champ modifie.
  // On relance donc le trigger des deux dates des qu'elles changent, pour que
  // le message disparaisse des qu'il est corrige. On ne declenche rien tant
  // que les deux dates ne sont pas renseignees (pas d'erreur a l'arrivee sur
  // l'etape).
  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    void trigger(["date_debut", "date_fin_prevue"]);
  }, [dateDebut, dateFin, trigger]);

  // Sauvegarde auto brouillon toutes les 30s (section 8.2)
  const { effacerBrouillon } = useWizardDraft({
    cle: "projet-wizard",
    valeurs: { ...valeurs, etapeActive },
    actif: !creation.isPending,
    onRestaurer: (d) => {
      const { etapeActive: etapeSauvegardee, ...formulaire } = d;
      reset({
        ...(formulaire as ProjetFormValues),
        porteur: formulaire.porteur ?? {
          mode: "nouveau",
          type_porteur: "PERSONNE",
          nom: "",
          institution_rattachement: "",
        },
      });
      if (etapeSauvegardee !== undefined) {
        setEtapeActive(
          Math.min(Math.max(Number(etapeSauvegardee), 0), ETAPES.length - 1),
        );
      }
      toast.info("Brouillon restauré");
    },
  });

  const suivant = async () => {
    if (derniereEtape) {
      handleSubmit(onSubmit)();
      return;
    }

    // Etape 1 (informations) : les champs obligatoires doivent etre renseignes
    // avant de passer aux dates (le superRefine de Zod ne s'applique que si le
    // schema de base est valide, inutile d'avancer avec des champs vides).
    if (etapeActive === 0) {
      const infosValides = await trigger(["nom", "type"]);
      if (!infosValides) return;
    }

    // Etape 2 (dates) : le passage est bloque tant que les dates sont invalides.
    if (etapeActive === 1) {
      const datesValides = await trigger(["date_debut", "date_fin_prevue"]);
      if (!datesValides) return;
    }

    // Etape 3 (porteur) : le porteur est obligatoire, le schema valide la
    // union discriminee en entier (porteur existant selectionne ou porteur
    // nouveau completement renseigne).
    if (etapeActive === 2) {
      const porteurValide = await trigger("porteur");
      if (!porteurValide) return;
    }

    setEtapeActive((e) => e + 1);
  };

  const precedent = () => setEtapeActive((e) => Math.max(0, e - 1));

  function onSubmit(valeurs: ProjetFormValues) {
    creation.mutate(valeurs, {
      onSuccess: async (projet) => {
        effacerBrouillon();
        const documentsEnErreur: DocumentEnAttente[] = [];
        if (estPresidence) {
          for (const document of documentsEnAttente) {
            try {
              await uploadDocument.mutateAsync({
                fichier: document.fichier,
                type: document.type,
                projet_id: projet.id,
              });
            } catch {
              documentsEnErreur.push(document);
            }
          }
        }
        toast.success("Projet créé avec succès !");
        if (documentsEnErreur.length > 0) {
          toast.error(`${documentsEnErreur.length} document${documentsEnErreur.length > 1 ? "s n’ont" : " n’a"} pas pu être téléversé${documentsEnErreur.length > 1 ? "s" : ""}. Vous pourrez réessayer depuis la fiche du projet.`);
        }
        onSucces(projet);
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Erreur lors de la création.");
      },
    });
  }

  const contenuEtapes = [
    // Etape 1 : Informations generales
    <div key="info" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom">
            Nom du projet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nom"
            aria-invalid={!!errors.nom}
            placeholder="Ex : Valorisation de la biodiversité de Ranomafana"
            {...register("nom")}
          />
          {errors.nom && (
            <p className="text-sm text-destructive">{errors.nom.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="intitule_officiel">Intitulé officiel</Label>
          <Input
            id="intitule_officiel"
            placeholder="Ex : Programme de recherche Ranomafana 2027"
            {...register("intitule_officiel")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">
            Type <span className="text-destructive">*</span>
          </Label>
          <Input
            id="type"
            aria-invalid={!!errors.type}
            placeholder="Ex : Recherche"
            {...register("type")}
          />
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="domaine">Domaine</Label>
          <Input id="domaine" {...register("domaine")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            className="font-mono"
            {...register("budget")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border p-4">
        <Label>Documents facultatifs</Label>
        {estPresidence ? (
          <DocumentDropzone
            modePreparation
            onDocumentPret={setDocumentsEnAttente}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Les documents officiels des projets sont gérés par la Présidence.
          </p>
        )}
      </div>
    </div>,

    // Etape 2 : Dates et statut
    <div key="dates" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_debut">
            Date de début <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date_debut"
            type="date"
            min={aujourdHui}
            aria-invalid={!!errors.date_debut}
            {...register("date_debut")}
          />
          {errors.date_debut && (
            <p className="text-sm text-destructive">
              {errors.date_debut.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_fin_prevue">
            Date de fin prévue <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date_fin_prevue"
            type="date"
            min={dateDebut || aujourdHui}
            aria-invalid={!!errors.date_fin_prevue}
            {...register("date_fin_prevue")}
          />
          {errors.date_fin_prevue && (
            <p className="text-sm text-destructive">
              {errors.date_fin_prevue.message}
            </p>
          )}
        </div>
        {estPresidence ? (
          <div className="flex flex-col gap-1.5">
            <Label>Statut</Label>
            <Controller
              control={control}
              name="statut"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        ) : null}
      </div>
      <p
        className="text-xs text-muted-foreground"
        data-aide-contextuelle-contenu
      >
        Le statut est défini à BROUILLON par défaut. Vous pourrez le modifier
        ultérieurement.
      </p>
    </div>,

    // Etape 3 : Porteur (obligatoire) et etablissement responsable (facultatif)
    <div key="porteur" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>
          Porteur du projet <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="porteur"
          render={({ field }) => (
            <SelectionPorteur
              valeur={field.value as PorteurFormValue | null}
              onChange={field.onChange}
            />
          )}
        />
        {errors.porteur && (
          <p className="text-sm text-destructive">
            {messageErreurPorteur(errors.porteur) ??
              "Le porteur du projet est obligatoire."}
          </p>
        )}
      </div>
      {estPresidence ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="etablissement_id">
            Établissement responsable (facultatif)
          </Label>
          <Controller
            control={control}
            name="etablissement_id"
            render={({ field }) => (
              <select
                id="etablissement_id"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-invalid={!!errors.etablissement_id}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
              >
                <option value="">Aucun — projet transversal</option>
                {etablissements.map((etablissement) => (
                  <option key={etablissement.id} value={etablissement.id}>
                    {etablissement.sigle
                      ? `${etablissement.sigle} — ${etablissement.nom}`
                      : etablissement.nom}
                  </option>
                ))}
              </select>
            )}
          />
          <p
            className="text-xs text-muted-foreground"
            data-aide-contextuelle-contenu
          >
            Ce rattachement est distinct du porteur et peut rester vide.
          </p>
        </div>
      ) : (
        <p
          className="text-xs text-muted-foreground"
          data-aide-contextuelle-contenu
        >
          Le projet sera rattaché automatiquement à votre établissement.
        </p>
      )}
    </div>,

    // Etape 4 : Referentiels (bailleurs, beneficiaires, sites)
    <div key="refs" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Bailleurs</Label>
        <Controller
          control={control}
          name="bailleurs_ids"
          render={({ field }) => (
            <SelectionBailleurs
              valeur={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Bénéficiaires</Label>
        <Controller
          control={control}
          name="beneficiaires_ids"
          render={({ field }) => (
            <SelectionBeneficiaires
              valeur={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Sites concernés</Label>
        <Controller
          control={control}
          name="sites_ids"
          render={({ field }) => (
            <SelectionSites
              valeur={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>,

    // Etape 5 : Recapitulatif
    <div key="recap" className="flex flex-col gap-4">
      <h3 className="font-heading text-sm font-medium text-muted-foreground">
        Vérifiez les informations avant la création
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <RecapChamp label="Nom" valeur={valeurs.nom || "—"} />
        <RecapChamp
          label="Établissement responsable"
          valeur={
            estPresidence
              ? valeurs.etablissement_id
                ? (etablissements.find((e) => e.id === valeurs.etablissement_id)
                    ?.nom ?? "Établissement sélectionné")
                : "Aucun — projet transversal"
              : (utilisateur?.etablissement_nom ?? "Votre établissement")
          }
        />
        <RecapChamp label="Type" valeur={valeurs.type || "—"} />
        <RecapChamp label="Domaine" valeur={valeurs.domaine || "—"} />
        <RecapChamp
          label="Budget"
          valeur={
            valeurs.budget
              ? `${valeurs.budget.toLocaleString("fr-FR")} MGA`
              : "—"
          }
        />
        <RecapChamp label="Date de début" valeur={valeurs.date_debut || "—"} />
        <RecapChamp
          label="Date de fin prévue"
          valeur={valeurs.date_fin_prevue || "—"}
        />
        <RecapChamp
          label="Statut"
          valeur={
            STATUTS.find((s) => s.value === valeurs.statut)?.label ??
            valeurs.statut
          }
        />
        <RecapChamp
          label="Porteur"
          valeur={libellePorteurRecap(valeurs.porteur)}
        />
        <RecapChamp
          label="Bailleurs"
          valeur={`${valeurs.bailleurs_ids?.length ?? 0} sélectionné(s)`}
        />
        <RecapChamp
          label="Bénéficiaires"
          valeur={`${valeurs.beneficiaires_ids?.length ?? 0} sélectionné(s)`}
        />
        <RecapChamp
          label="Sites"
          valeur={`${valeurs.sites_ids?.length ?? 0} sélectionné(s)`}
        />
      </div>
      {valeurs.intitule_officiel && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Intitulé officiel
          </span>
          <p className="text-sm text-foreground">{valeurs.intitule_officiel}</p>
        </div>
      )}
    </div>,
  ];

  return (
    <div className="flex flex-col gap-6">
      <WizardProgressBar etapes={ETAPES} etapeActive={etapeActive} />

      <div className="min-h-48">{contenuEtapes[etapeActive]}</div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={precedent}
          disabled={etapeActive === 0 || creation.isPending}
        >
          Précédent
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={suivant}
            disabled={creation.isPending || uploadDocument.isPending}
          >
            {(creation.isPending || uploadDocument.isPending) && <LoaderCircle className="animate-spin" />}
            {derniereEtape ? "Créer le projet" : "Suivant"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onAnnuler}
            disabled={creation.isPending || uploadDocument.isPending}
            className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)]"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

// Les erreurs de la union discriminee "porteur" sont parfois imbriquees
// (porteur.nom, porteur.porteur_id, porteur.etablissement_id) : on en extrait
// le premier message affichable sous le champ.
function messageErreurPorteur(erreur: unknown): string | undefined {
  if (!erreur || typeof erreur !== "object") return undefined;

  for (const cle of ["nom", "porteur_id", "etablissement_id"]) {
    const imbrique = (erreur as Record<string, unknown>)[cle];
    if (imbrique && typeof imbrique === "object") {
      const message = (imbrique as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }

  const message = (erreur as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

function RecapChamp({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{valeur}</span>
    </div>
  );
}

function libellePorteurRecap(
  porteur: PorteurFormValue | null | undefined,
): string {
  if (!porteur) return "Non defini";
  if (porteur.mode === "existant") return "Porteur existant selectionne";
  switch (porteur.type_porteur) {
    case "PERSONNE":
      return `Personne : ${porteur.nom}`;
    case "ETABLISSEMENT":
      return "Etablissement";
    case "AUTRE":
      return `Autre : ${porteur.nom}`;
  }
}
