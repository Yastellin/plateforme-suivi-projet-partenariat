import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartenaireForm } from "../components/PartenaireForm";
import { useCreatePartenaire } from "../api/useCreatePartenaire";
import {
  useVerificationNomPartenaire,
  type ResultatVerificationNomPartenaire,
} from "../api/useVerificationNomPartenaire";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import type { PartenaireFormValues } from "@/lib/validators/partenaire.schema";
import {
  CLE_BROUILLON_PARTENARIAT_SESSION,
  lireBrouillonPartenariatSession,
  type BrouillonPartenariatSession,
} from "@/features/partenariats/session-draft";
import type { PartenariatFormValues } from "@/lib/validators/partenariat.schema";

function assainirNomSaisi(valeur: string): string {
  return Array.from(valeur.replace(/\s+/g, " ").replace(/^\s+/, ""))
    .filter((caractere) => {
      const code = caractere.codePointAt(0) ?? 0;
      return code >= 32 && code !== 127;
    })
    .join("");
}

function traduireErreurCreationPartenaire(message: string): string {
  if (/partenaire.*existe déjà|partenaire.*existe deja/i.test(message)) {
    return "Ce partenaire existe déjà. Ouvrez sa fiche ou vérifiez le nom avant de réessayer.";
  }
  return message;
}

function ResultatsVerification({
  resultat,
  cheminBase,
}: {
  resultat?: ResultatVerificationNomPartenaire;
  cheminBase: string;
}) {
  if (!resultat) return null;

  if (resultat.doublon_exact) {
    if (resultat.correspondants.length === 0) {
      return (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
        >
          Un partenaire portant ce nom existe déjà, mais sa fiche n’est pas
          visible depuis votre compte.
        </p>
      );
    }

    return (
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
      >
        <p className="text-sm font-medium">
          Un partenaire portant ce nom existe déjà. Consultez sa fiche plutôt
          que d’en créer une autre.
        </p>
        <ul className="flex flex-col gap-1">
          {resultat.correspondants.map((partenaire) => (
            <li key={partenaire.id}>
              <Link
                to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand)] underline underline-offset-2"
              >
                Ouvrir la fiche de {partenaire.nom}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {resultat.similaires.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-md border border-[var(--status-attente-fg)]/40 bg-[var(--status-attente-bg)] p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--status-attente-fg)]">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            Des noms proches ont été trouvés. Vérifiez qu’il ne s’agit pas du
            même partenaire.
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {resultat.similaires.map((partenaire) => (
              <li key={partenaire.id}>
                <Link
                  to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                  className="font-semibold text-[var(--color-brand)] underline underline-offset-2"
                >
                  {partenaire.nom}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  — {partenaire.type}, {partenaire.pays}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-sm text-emerald-700">
        Aucun doublon exact : vous pouvez continuer.
      </p>
    </div>
  );
}

export function PartenaireCreatePage() {
  const navigate = useNavigate();
  const [parametresRecherche] = useSearchParams();
  const retourWizard =
    parametresRecherche.get("retour") === "wizard-partenariat";
  const nomDepuisUrl = parametresRecherche.get("nom")?.trim() ?? "";
  const { utilisateur } = useAuth();
  const [nomRecherche, setNomRecherche] = useState(() => {
    if (nomDepuisUrl) return assainirNomSaisi(nomDepuisUrl);
    return retourWizard
      ? (lireBrouillonPartenariatSession()?.nomPartenaire ?? "")
      : "";
  });
  const [etapeFormulaire, setEtapeFormulaire] = useState(retourWizard);
  const [dialogueOuvert, setDialogueOuvert] = useState(!retourWizard);
  const derniereErreurToast = useRef(0);
  const dernierDoublonJournalise = useRef("");

  const estPresidence = utilisateur?.role === "PRESIDENCE";
  const nomDifferee = useDebounce(nomRecherche, 350);
  const {
    data: verification,
    isFetching,
    isError,
    errorUpdatedAt,
  } = useVerificationNomPartenaire(nomDifferee);
  const { mutate: creer, isPending } = useCreatePartenaire();
  const cheminBase = estPresidence ? "/presidence" : "/etablissement";
  const rechercheAjour = nomRecherche.trim() === nomDifferee.trim();
  const resultatCourant =
    rechercheAjour && !isFetching ? verification : undefined;
  const nomSaisiValide = nomRecherche.trim().length >= 2;
  const peutContinuer =
    nomSaisiValide &&
    rechercheAjour &&
    !isFetching &&
    !isError &&
    verification !== undefined &&
    !verification.doublon_exact;

  useEffect(() => {
    if (isError && errorUpdatedAt !== derniereErreurToast.current) {
      derniereErreurToast.current = errorUpdatedAt;
      toast.error(
        "La vérification du nom a échoué. Vérifiez votre connexion et réessayez.",
      );
    }
  }, [errorUpdatedAt, isError]);

  useEffect(() => {
    if (!resultatCourant?.doublon_exact) {
      dernierDoublonJournalise.current = "";
      return;
    }
    const cle = nomDifferee.trim().toLocaleLowerCase("fr");
    if (cle && dernierDoublonJournalise.current !== cle) {
      dernierDoublonJournalise.current = cle;
      console.log("Doublon exact de partenaire détecté.", {
        nom: nomDifferee.trim(),
      });
    }
  }, [nomDifferee, resultatCourant]);

  function annulerCreation() {
    navigate(
      retourWizard
        ? `${cheminBase}/partenaires-partenariats/partenariats/nouveau`
        : `${cheminBase}/partenaires-partenariats/partenaires`,
    );
  }

  function onSoumettre(valeurs: PartenaireFormValues, logo?: File) {
    creer(
      { valeurs, logo },
      {
        onSuccess: ({ partenaire, logoTeleverse }) => {
          if (logo && !logoTeleverse) {
            toast.error(
              "Partenaire créé, mais le logo n’a pas pu être envoyé. Vous pourrez le réessayer depuis sa fiche.",
            );
          } else {
            toast.success(
              logo ? "Partenaire créé avec son logo" : "Partenaire créé",
            );
          }
          if (retourWizard) {
            const brouillonActuel = lireBrouillonPartenariatSession();
            const formulaireParDefaut: PartenariatFormValues = {
              intitule: "",
              objet: "",
              domaine: "AUTRE",
              date_debut: "",
              date_fin: "",
              partenaires_ids: [],
              etablissements_ids: [],
            };
            const formulaire =
              brouillonActuel?.formulaire ?? formulaireParDefaut;
            const brouillonActualise: BrouillonPartenariatSession = {
              formulaire: {
                ...formulaire,
                partenaires_ids: Array.from(
                  new Set([...formulaire.partenaires_ids, partenaire.id]),
                ),
                etablissements_ids: [],
              },
              libelles: {
                ...brouillonActuel?.libelles,
                [partenaire.id]: partenaire.nom,
              },
              etape: 0,
              version: 2,
              nomPartenaire: partenaire.nom,
            };
            window.sessionStorage.setItem(
              CLE_BROUILLON_PARTENARIAT_SESSION,
              JSON.stringify(brouillonActualise),
            );
            navigate(
              `${cheminBase}/partenaires-partenariats/partenariats/nouveau`,
            );
            return;
          }
          navigate(`${cheminBase}/partenaires-partenariats/partenaires`);
        },
        onError: (erreur: Error) => {
          toast.error(traduireErreurCreationPartenaire(erreur.message));
        },
      },
    );
  }

  function continuerVersFormulaire() {
    setNomRecherche(nomRecherche.trim());
    setDialogueOuvert(false);
    setEtapeFormulaire(true);
  }

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <PageHeader
        titre="Nouveau partenaire"
        description="Enregistrez un nouveau partenaire dans la plateforme."
      />

      <Panel>
        <PanelBody>
          {etapeFormulaire ? (
            <PartenaireForm
              nomInitial={nomRecherche}
              peutGererVisibilite={estPresidence}
              onAnnuler={annulerCreation}
              onSoumettre={onSoumettre}
              enCours={isPending}
            />
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                Vérifiez d’abord si ce partenaire est déjà enregistré.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setDialogueOuvert(true)}>
                  Vérifier le nom
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={annulerCreation}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>

      <Dialog open={dialogueOuvert} onOpenChange={setDialogueOuvert}>
        <DialogContent className="sm:max-w-[560px]" showCloseButton={false}>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Fermer la vérification du partenaire"
              className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-muted"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Ce partenaire existe-t-il déjà ?</DialogTitle>
            <DialogDescription>
              Saisissez son nom pour rechercher les doublons exacts et les noms
              proches avant de créer une nouvelle fiche.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-verification-partenaire">
                Nom du partenaire
              </Label>
              <Input
                id="nom-verification-partenaire"
                autoFocus
                autoComplete="organization"
                value={nomRecherche}
                onChange={(evenement) =>
                  setNomRecherche(assainirNomSaisi(evenement.target.value))
                }
                placeholder="Ex. : Université d’Antananarivo"
                aria-describedby="aide-verification-partenaire"
              />
              <p
                id="aide-verification-partenaire"
                className="text-xs text-muted-foreground"
              >
                Les espaces superflus sont supprimés. La casse et les accents ne
                changent pas la détection.
              </p>
            </div>

            {nomSaisiValide && (!rechercheAjour || isFetching) ? (
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                Vérification en cours…
              </p>
            ) : null}
            {!nomSaisiValide ? (
              <p className="text-sm text-muted-foreground">
                Saisissez au moins 2 caractères pour lancer la vérification.
              </p>
            ) : null}
            {isError && rechercheAjour ? (
              <p role="alert" className="text-sm text-destructive">
                La vérification a échoué. Réessayez avant de continuer.
              </p>
            ) : null}
            <ResultatsVerification
              resultat={resultatCourant}
              cheminBase={cheminBase}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogueOuvert(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={continuerVersFormulaire}
              disabled={!peutContinuer}
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
