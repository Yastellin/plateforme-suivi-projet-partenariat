// src/features/comptes/pages/ParametresCompte.tsx

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, ChevronDown, Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { LogoUploader } from "@/components/shared/LogoUploader";
import { FormulaireMotDePasse } from "@/features/comptes/components/FormulaireMotDePasse";
import {
  useCompte,
  useConfigurationInstitutionnelle,
  useModifierPreferences,
} from "@/features/comptes/api/useCompte";
import {
  useCreerUtilisateur,
  useModifierAccesUtilisateur,
  useUtilisateurs,
} from "@/features/comptes/api/useUtilisateurs";
import { useEtablissement } from "@/features/etablissements/api/useEtablissement";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import type { PreferencesCompte, RoleUtilisateur } from "@/types/api";

const LIBELLES_ROLES: Record<RoleUtilisateur, string> = {
  PRESIDENCE: "Présidence",
  ETABLISSEMENT: "Établissement",
  DECIDEUR: "Décideur",
};

const ERREUR_EMAIL_EXISTANT =
  "Un compte utilise déjà cette adresse e-mail.";
const ERREUR_ETABLISSEMENT_EXISTANT =
  "Cet établissement est déjà enregistré. Utilisez son compte existant ou demandez à la Présidence de vérifier la fiche.";

function normaliserAdresseEmail(email: string): string {
  return email.trim().toLocaleLowerCase("fr");
}

function normaliserNomEtablissement(nom: string): string {
  return nom
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("fr");
}

const DROITS: Record<RoleUtilisateur, string[]> = {
  PRESIDENCE: [
    "Consulter toutes les données",
    "Créer, modifier, publier et archiver",
    "Administrer les comptes et les logos",
    "Exporter les données",
  ],
  ETABLISSEMENT: [
    "Gérer les données créées par son établissement",
    "Soumettre projets, partenaires et partenariats",
    "Gérer ses contacts et son logo institutionnel",
  ],
  DECIDEUR: ["Consulter les données et statistiques", "Accès en lecture seule"],
};

export function ParametresCompte() {
  const { utilisateur } = useAuth();
  const { definirTheme } = useTheme();
  const estPresidence = utilisateur?.role === "PRESIDENCE";
  const { data: compte } = useCompte();
  const { data: configuration } =
    useConfigurationInstitutionnelle(estPresidence);
  const { data: etablissement } = useEtablissement(
    utilisateur?.etablissement_id ?? "",
  );
  const { data: utilisateurs } = useUtilisateurs(estPresidence);
  const { data: pageEtablissements } = useEtablissements();
  const etablissements = pageEtablissements?.data ?? [];
  const modifierPreferences = useModifierPreferences();
  const modifierAcces = useModifierAccesUtilisateur();
  const creerUtilisateur = useCreerUtilisateur();
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [erreurEmailServeur, setErreurEmailServeur] = useState(false);
  const [erreurNomEtablissementServeur, setErreurNomEtablissementServeur] =
    useState(false);
  const [brouillonsAcces, setBrouillonsAcces] = useState<
    Record<string, { role: RoleUtilisateur; etablissement_id: string }>
  >({});
  const [nouveauCompte, setNouveauCompte] = useState<{
    email: string;
    mot_de_passe: string;
    role: RoleUtilisateur;
    etablissement_nom: string;
  }>({
    email: "",
    mot_de_passe: "",
    role: "ETABLISSEMENT",
    etablissement_nom: "",
  });
  const [preferencesLocales, setPreferences] =
    useState<PreferencesCompte | null>(null);
  const preferences: PreferencesCompte = preferencesLocales ?? {
    theme: compte?.preferences?.theme ?? "SYSTEME",
    densite: compte?.preferences?.densite ?? "CONFORTABLE",
    animations: compte?.preferences?.animations ?? true,
    aide_contextuelle: compte?.preferences?.aide_contextuelle ?? true,
  };

  const emailNouveauCompteNormalise = normaliserAdresseEmail(
    nouveauCompte.email,
  );
  const compteEmailDuplique = (utilisateurs ?? []).find(
    (item) =>
      normaliserAdresseEmail(item.email) === emailNouveauCompteNormalise &&
      Boolean(emailNouveauCompteNormalise),
  );
  const emailDuplique = Boolean(compteEmailDuplique) || erreurEmailServeur;
  const messageEmailDuplique = compteEmailDuplique
    ? `Cette adresse e-mail est déjà utilisée par un compte ${LIBELLES_ROLES[compteEmailDuplique.role]}. Choisissez une autre adresse.`
    : `${ERREUR_EMAIL_EXISTANT} Choisissez une autre adresse.`;
  const emailNouveauCompteValide =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nouveauCompte.email.trim()) &&
    !emailDuplique;
  const motDePasseNouveauCompteValide = nouveauCompte.mot_de_passe.length >= 8;
  const nomEtablissementNormalise = normaliserNomEtablissement(
    nouveauCompte.etablissement_nom,
  );
  const etablissementDuplique =
    Boolean(nomEtablissementNormalise) &&
    etablissements.some(
      (item) =>
        normaliserNomEtablissement(item.nom) === nomEtablissementNormalise,
    );
  const nomEtablissementDejaPris =
    etablissementDuplique || erreurNomEtablissementServeur;
  const etablissementNouveauCompteValide =
    nouveauCompte.role !== "ETABLISSEMENT" ||
    (Boolean(nomEtablissementNormalise) && !nomEtablissementDejaPris);
  const nouveauCompteValide =
    emailNouveauCompteValide &&
    motDePasseNouveauCompteValide &&
    etablissementNouveauCompteValide;

  function appliquerPreferences(suivantes: PreferencesCompte) {
    const theme =
      suivantes.theme === "SOMBRE"
        ? "dark"
        : suivantes.theme === "CLAIR"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    definirTheme(theme);
    document.documentElement.dataset.density =
      suivantes.densite ?? "CONFORTABLE";
    document.documentElement.classList.toggle(
      "animations-reduites",
      suivantes.animations === false,
    );
    document.documentElement.dataset.aideContextuelle = String(
      suivantes.aide_contextuelle !== false,
    );
  }

  function enregistrerPreferences(suivantes: PreferencesCompte) {
    if (modifierPreferences.isPending) return;
    const precedentes = preferences;
    setPreferences(suivantes);
    appliquerPreferences(suivantes);
    modifierPreferences.mutate(suivantes, {
      onSuccess: () => toast.success("Préférences enregistrées"),
      onError: (erreur) => {
        setPreferences(precedentes);
        appliquerPreferences(precedentes);
        toast.error(erreur.message);
      },
    });
  }

  function soumettreNouveauCompte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nouveauCompteValide) return;
    const payload =
      nouveauCompte.role === "ETABLISSEMENT"
        ? {
            email: nouveauCompte.email.trim(),
            mot_de_passe: nouveauCompte.mot_de_passe,
            role: "ETABLISSEMENT" as const,
            etablissement_nom: nouveauCompte.etablissement_nom
              .trim()
              .replace(/\s+/gu, " "),
          }
        : {
            email: nouveauCompte.email.trim(),
            mot_de_passe: nouveauCompte.mot_de_passe,
            role: nouveauCompte.role,
          };

    creerUtilisateur.mutate(payload, {
      onSuccess: () => {
        toast.success("Compte créé");
        setNouveauCompte({
          email: "",
          mot_de_passe: "",
          role: "ETABLISSEMENT",
          etablissement_nom: "",
        });
        setErreurEmailServeur(false);
        setErreurNomEtablissementServeur(false);
        setCreationOuverte(false);
      },
      onError: (erreur) => {
        if (erreur.message === ERREUR_EMAIL_EXISTANT) {
          setErreurEmailServeur(true);
        }
        if (erreur.message === ERREUR_ETABLISSEMENT_EXISTANT) {
          setErreurNomEtablissementServeur(true);
        }
        toast.error(erreur.message);
      },
    });
  }

  const role = (compte?.role ??
    utilisateur?.role ??
    "DECIDEUR") as RoleUtilisateur;

  const afficherLogo = estPresidence || Boolean(etablissement);

  const emailAffiche = compte?.email ?? utilisateur?.email ?? "—";
  const etablissementAffiche =
    compte?.etablissement_nom ?? utilisateur?.etablissement_nom ?? null;
  const compteActif = compte?.actif !== false;

  return (
    <div className="w-full px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Paramètres du compte
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Gérez la sécurité, l'interface et les droits d'accès de votre compte.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Mon compte */}
        <section
          id="compte"
          className={cn(CLASSE_CARTE, "overflow-hidden")}
        >
          <div className="flex items-center gap-4 p-6">
            <div
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-emerald-600 text-base font-bold text-white"
            >
              {initialesEmail(emailAffiche)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-white">
                {emailAffiche}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
                  {LIBELLES_ROLES[role]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    compteActif
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                      : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      compteActif
                        ? "bg-emerald-500"
                        : "bg-slate-400 dark:bg-slate-500",
                    )}
                  />
                  {compteActif ? "Actif" : "Désactivé"}
                </span>
              </div>
            </div>
          </div>

          <dl className="grid gap-5 border-t border-black/5 p-6 sm:grid-cols-3 dark:border-white/10">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Rôle
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {LIBELLES_ROLES[role]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Établissement
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {etablissementAffiche ?? (
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    Non rattaché
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                État du compte
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {compteActif ? "Actif" : "Désactivé"}
              </dd>
            </div>
          </dl>

          <div className="border-t border-black/5 p-6 dark:border-white/10">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <ShieldCheck
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Droits effectifs
            </h2>
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {DROITS[role].map((droit) => (
                <li
                  key={droit}
                  className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {droit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. Préférences */}
        <section id="prefs" className={cn(CLASSE_CARTE, "p-6")}>
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Préférences d'interface
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Synchronisées avec votre compte
              </p>
            </div>
            {modifierPreferences.isPending ? (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Enregistrement…
              </span>
            ) : null}
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/10">
            <LignePreference
              titre="Thème"
              description="Apparence claire, sombre, ou selon le système."
            >
              <ControleSegmente
                libelle="Thème"
                valeur={preferences.theme ?? "SYSTEME"}
                options={[
                  ["SYSTEME", "Système"],
                  ["CLAIR", "Clair"],
                  ["SOMBRE", "Sombre"],
                ]}
                onChange={(theme) =>
                  enregistrerPreferences({
                    ...preferences,
                    theme: theme as PreferencesCompte["theme"],
                  })
                }
              />
            </LignePreference>
            <LignePreference
              titre="Densité"
              description="Espacement des tableaux et des listes."
            >
              <ControleSegmente
                libelle="Densité"
                valeur={preferences.densite ?? "CONFORTABLE"}
                options={[
                  ["CONFORTABLE", "Confortable"],
                  ["COMPACTE", "Compacte"],
                ]}
                onChange={(densite) =>
                  enregistrerPreferences({
                    ...preferences,
                    densite: densite as PreferencesCompte["densite"],
                  })
                }
              />
            </LignePreference>
            <LignePreference
              titre="Animations d'interface"
              description="Transitions et mouvements à l'écran."
            >
              <Interrupteur
                libelle="Animations d'interface"
                coche={preferences.animations ?? true}
                onChange={(animations) =>
                  enregistrerPreferences({ ...preferences, animations })
                }
              />
            </LignePreference>
            <LignePreference
              titre="Aide contextuelle"
              description="Conseils d'utilisation affichés dans l'interface."
            >
              <Interrupteur
                libelle="Aide contextuelle"
                coche={preferences.aide_contextuelle ?? true}
                onChange={(aide_contextuelle) =>
                  enregistrerPreferences({
                    ...preferences,
                    aide_contextuelle,
                  })
                }
              />
            </LignePreference>
          </div>
        </section>

        {/* 3. Sécurité et 4. Logo */}
        <div className="grid gap-6 lg:grid-cols-5">
          <section
            id="secu"
            className={cn(
              CLASSE_CARTE,
              "p-6",
              afficherLogo ? "lg:col-span-3" : "lg:col-span-5",
            )}
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Sécurité
            </h2>
            <p className="mt-0.5 mb-5 text-xs text-slate-500 dark:text-slate-400">
              Entre 8 et 72 caractères, avec une majuscule, une minuscule et
              un chiffre.
            </p>
            <FormulaireMotDePasse />
          </section>

          {afficherLogo ? (
            <section
              id="logo"
              className={cn(CLASSE_CARTE, "p-6 lg:col-span-2")}
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Logo institutionnel
              </h2>
              <p className="mt-0.5 mb-5 text-xs text-slate-500 dark:text-slate-400">
                Affiché dans l'en-tête et les documents.
              </p>
              {estPresidence ? (
                <LogoUploader
                  variante="compte"
                  endpoint="/configuration/logo"
                  logoUrl={configuration?.logo_url}
                  nom="Présidence"
                  queryKeys={[["configuration"], ["public", "configuration"]]}
                />
              ) : etablissement ? (
                <LogoUploader
                  variante="compte"
                  endpoint={`/etablissements/${etablissement.id}/logo`}
                  logoUrl={etablissement.logo_url}
                  nom={etablissement.nom}
                  queryKeys={[
                    ["etablissements", etablissement.id],
                    ["etablissements"],
                    ["partenariats"],
                    ["projets"],
                    ["synthese"],
                    ["public"],
                    ["public-etablissements"],
                    ["public-publications"],
                    ["public-publication"],
                  ]}
                />
              ) : null}
            </section>
          ) : null}
        </div>

        {/* 5. Utilisateurs et accès */}
        {estPresidence ? (
          <section
            id="users"
            className={cn(CLASSE_CARTE, "overflow-hidden")}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Utilisateurs et accès
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Activez ou suspendez les comptes sans supprimer leur
                  historique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreationOuverte((ouverte) => !ouverte)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau compte
              </button>
            </div>

            {creationOuverte ? (
              <form
                onSubmit={soumettreNouveauCompte}
                className="mx-6 mb-6 grid gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-emerald-400/20 dark:bg-emerald-400/5"
              >
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Adresse e-mail
                  <input
                    id="nouveau-compte-email"
                    type="email"
                    required
                    aria-invalid={
                      Boolean(nouveauCompte.email) && !emailNouveauCompteValide
                    }
                    aria-describedby={
                      nouveauCompte.email && !emailNouveauCompteValide
                        ? "erreur-nouvel-email"
                        : undefined
                    }
                    value={nouveauCompte.email}
                    onChange={(event) => {
                      setNouveauCompte({
                        ...nouveauCompte,
                        email: event.target.value,
                      });
                      setErreurEmailServeur(false);
                    }}
                    placeholder="partenariats@univ-fianarantsoa.mg"
                    className={cn(
                      CLASSE_CHAMP,
                      nouveauCompte.email && !emailNouveauCompteValide
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10",
                    )}
                  />
                  {nouveauCompte.email && !emailNouveauCompteValide ? (
                    <span
                      id="erreur-nouvel-email"
                      className="text-xs font-normal text-red-600 dark:text-red-400"
                    >
                      {emailDuplique
                        ? messageEmailDuplique
                        : "Saisissez une adresse e-mail valide."}
                    </span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mot de passe initial
                  <input
                    type="password"
                    required
                    minLength={8}
                    aria-invalid={
                      Boolean(nouveauCompte.mot_de_passe) &&
                      !motDePasseNouveauCompteValide
                    }
                    value={nouveauCompte.mot_de_passe}
                    onChange={(event) =>
                      setNouveauCompte({
                        ...nouveauCompte,
                        mot_de_passe: event.target.value,
                      })
                    }
                    className={cn(
                      CLASSE_CHAMP,
                      nouveauCompte.mot_de_passe &&
                        !motDePasseNouveauCompteValide
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10",
                    )}
                  />
                  {nouveauCompte.mot_de_passe &&
                  !motDePasseNouveauCompteValide ? (
                    <span className="text-xs font-normal text-red-600 dark:text-red-400">
                      Utilisez au moins 8 caractères.
                    </span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Rôle
                  <div className="relative">
                    <select
                      value={nouveauCompte.role}
                      onChange={(event) => {
                        const role = event.target.value as RoleUtilisateur;
                        setNouveauCompte({
                          ...nouveauCompte,
                          role,
                          etablissement_nom:
                            role === "ETABLISSEMENT"
                              ? nouveauCompte.etablissement_nom
                              : "",
                        });
                        setErreurNomEtablissementServeur(false);
                      }}
                      className={cn(
                        CLASSE_CHAMP,
                        "appearance-none pr-9 border-slate-300 dark:border-white/10",
                      )}
                    >
                      <option value="ETABLISSEMENT">Établissement</option>
                      <option value="DECIDEUR">Décideur</option>
                      <option value="PRESIDENCE">Présidence</option>
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                    />
                  </div>
                </label>
                {nouveauCompte.role === "ETABLISSEMENT" ? (
                  <label
                    htmlFor="nouveau-compte-etablissement-nom"
                    className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Établissement
                    <input
                      id="nouveau-compte-etablissement-nom"
                      type="text"
                      required
                      maxLength={255}
                      aria-invalid={
                        Boolean(nouveauCompte.etablissement_nom) &&
                        !etablissementNouveauCompteValide
                      }
                      aria-describedby={
                        nouveauCompte.etablissement_nom &&
                        !etablissementNouveauCompteValide
                          ? "aide-nouvel-etablissement erreur-nouvel-etablissement"
                          : "aide-nouvel-etablissement"
                      }
                      value={nouveauCompte.etablissement_nom}
                      onChange={(event) => {
                        setNouveauCompte({
                          ...nouveauCompte,
                          etablissement_nom: event.target.value,
                        });
                        setErreurNomEtablissementServeur(false);
                      }}
                      placeholder="Nom du nouvel établissement"
                      className={cn(
                        CLASSE_CHAMP,
                        nouveauCompte.etablissement_nom &&
                          !etablissementNouveauCompteValide
                          ? "border-red-500 dark:border-red-400"
                          : "border-slate-300 dark:border-white/10",
                      )}
                    />
                    <span
                      id="aide-nouvel-etablissement"
                      className="text-xs font-normal text-slate-500 dark:text-slate-400"
                    >
                      Une nouvelle fiche d’établissement sera créée pour ce
                      compte.
                    </span>
                    {nouveauCompte.etablissement_nom &&
                    !etablissementNouveauCompteValide ? (
                      <span
                        id="erreur-nouvel-etablissement"
                        className="text-xs font-normal text-red-600 dark:text-red-400"
                      >
                        {nomEtablissementDejaPris
                          ? ERREUR_ETABLISSEMENT_EXISTANT
                          : "Saisissez un nom d’établissement valide."}
                      </span>
                    ) : null}
                  </label>
                ) : (
                  <span />
                )}
                <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    disabled={
                      creerUtilisateur.isPending || !nouveauCompteValide
                    }
                    className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {creerUtilisateur.isPending
                      ? "Création…"
                      : "Créer le compte"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationOuverte(false)}
                    className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-black/5 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : null}

            <div className="overflow-x-auto border-t border-black/5 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left font-semibold">
                      Compte
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Rôle
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Établissement
                    </th>
                    <th scope="col" className="px-6 py-3 text-right font-semibold">
                      Accès
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {(utilisateurs ?? []).map((item) => {
                    const estCompteCourant = item.id === utilisateur?.id;
                    const acces = brouillonsAcces[item.id] ?? {
                      role: item.role,
                      etablissement_id: item.etablissement_id ?? "",
                    };
                    const accesValide =
                      acces.role !== "ETABLISSEMENT" ||
                      Boolean(acces.etablissement_id);
                    const accesModifie =
                      acces.role !== item.role ||
                      (acces.role === "ETABLISSEMENT" &&
                        acces.etablissement_id !==
                          (item.etablissement_id ?? ""));
                    const suspendu = item.actif === false;
                    return (
                      <tr key={item.id} className={cn(suspendu && "opacity-60")}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200"
                            >
                              {initialesEmail(item.email)}
                            </span>
                            <span className="break-all font-medium text-slate-900 dark:text-slate-100">
                              {item.email}
                            </span>
                            {estCompteCourant ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                                Vous
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative w-40">
                            <select
                              aria-label={`Rôle de ${item.email}`}
                              value={acces.role}
                              disabled={
                                modifierAcces.isPending || estCompteCourant
                              }
                              onChange={(event) => {
                                const role = event.target
                                  .value as RoleUtilisateur;
                                setBrouillonsAcces((courants) => ({
                                  ...courants,
                                  [item.id]: {
                                    role,
                                    etablissement_id:
                                      role === "ETABLISSEMENT"
                                        ? (courants[item.id]?.etablissement_id ??
                                          "")
                                        : "",
                                  },
                                }));
                              }}
                              className={cn(
                                CLASSE_CHAMP_TABLE,
                                "w-40 appearance-none pr-9 border-slate-300 dark:border-white/10",
                              )}
                            >
                              <option value="PRESIDENCE">Présidence</option>
                              <option value="ETABLISSEMENT">Établissement</option>
                              <option value="DECIDEUR">Décideur</option>
                            </select>
                            <ChevronDown
                              aria-hidden="true"
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {acces.role === "ETABLISSEMENT" ? (
                            <div className="relative w-64">
                              <select
                                aria-label={`Établissement de ${item.email}`}
                                aria-invalid={!acces.etablissement_id}
                                value={acces.etablissement_id}
                                disabled={
                                  modifierAcces.isPending || estCompteCourant
                                }
                                onChange={(event) =>
                                  setBrouillonsAcces((courants) => ({
                                    ...courants,
                                    [item.id]: {
                                      role: acces.role,
                                      etablissement_id: event.target.value,
                                    },
                                  }))
                                }
                                className={cn(
                                  CLASSE_CHAMP_TABLE,
                                  "w-64 appearance-none pr-9 border-slate-300 dark:border-white/10",
                                )}
                              >
                                <option value="">Sélectionnez…</option>
                                {etablissements.map((etab) => (
                                  <option key={etab.id} value={etab.id}>
                                    {etab.nom}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                suspendu
                                  ? "text-slate-500 dark:text-slate-400"
                                  : "text-emerald-700 dark:text-emerald-300",
                              )}
                            >
                              {suspendu ? "Suspendu" : "Actif"}
                            </span>
                            {accesModifie ? (
                              <button
                                type="button"
                                disabled={
                                  modifierAcces.isPending ||
                                  estCompteCourant ||
                                  !accesValide
                                }
                                onClick={() =>
                                  modifierAcces.mutate(
                                    {
                                      id: item.id,
                                      role: acces.role,
                                      etablissement_id:
                                        acces.role === "ETABLISSEMENT"
                                          ? acces.etablissement_id
                                          : null,
                                    },
                                    {
                                      onSuccess: () => {
                                        setBrouillonsAcces((courants) => {
                                          const suivants = { ...courants };
                                          delete suivants[item.id];
                                          return suivants;
                                        });
                                        toast.success("Droits enregistrés");
                                      },
                                      onError: (erreur) =>
                                        toast.error(erreur.message),
                                    },
                                  )
                                }
                                className="h-8 rounded-lg border border-emerald-600 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                              >
                                Enregistrer
                              </button>
                            ) : null}
                            <button
                              type="button"
                              disabled={
                                modifierAcces.isPending ||
                                estCompteCourant ||
                                accesModifie
                              }
                              title={
                                estCompteCourant
                                  ? "Vous ne pouvez pas désactiver votre propre compte"
                                  : undefined
                              }
                              onClick={() =>
                                modifierAcces.mutate(
                                  { id: item.id, actif: suspendu },
                                  {
                                    onError: (erreur) =>
                                      toast.error(erreur.message),
                                  },
                                )
                              }
                              className={cn(
                                "h-8 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                suspendu
                                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/30 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                                  : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-400/10",
                              )}
                            >
                              {suspendu ? "Réactiver" : "Désactiver"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const CLASSE_CARTE =
  "rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-white/[.04]";

const CLASSE_CHAMP =
  "h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:bg-white/5 dark:text-slate-100";

const CLASSE_CHAMP_TABLE =
  "h-9 rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:bg-white/5 dark:text-slate-100";

function initialesEmail(email: string): string {
  const partieLocale = email.split("@")[0] ?? "";
  const morceaux = partieLocale.split(/[._\-\s]+/).filter(Boolean);
  if (morceaux.length >= 2) return `${morceaux[0][0]}${morceaux[1][0]}`.toUpperCase();
  return partieLocale.slice(0, 2).toUpperCase() || "?";
}

function LignePreference({
  titre,
  description,
  children,
}: {
  titre: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{titre}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ControleSegmente({
  libelle,
  valeur,
  options,
  onChange,
}: {
  libelle: string;
  valeur: string;
  options: [string, string][];
  onChange: (valeur: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={libelle}
      className="inline-flex shrink-0 rounded-xl bg-black/5 p-1 dark:bg-white/10"
    >
      {options.map(([cle, texte]) => {
        const actif = valeur === cle;
        return (
          <button
            key={cle}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => {
              if (!actif) onChange(cle);
            }}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-medium transition-colors",
              actif
                ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-500 dark:text-emerald-950"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            {texte}
          </button>
        );
      })}
    </div>
  );
}

function Interrupteur({
  libelle,
  coche,
  onChange,
}: {
  libelle: string;
  coche: boolean;
  onChange: (valeur: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={coche}
      aria-label={libelle}
      onClick={() => onChange(!coche)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        coche ? "bg-emerald-600" : "bg-slate-300 dark:bg-white/20",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          coche ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
