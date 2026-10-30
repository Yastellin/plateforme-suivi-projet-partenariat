// src/features/comptes/pages/ParametresCompte.tsx

import { useState, type FormEvent } from "react";
import { Check, Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel";
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
  const { data: pageEtablissements } = useEtablissements({
    page: 1,
    limit: 100,
  });
  const etablissements = pageEtablissements?.data ?? [];
  const modifierPreferences = useModifierPreferences();
  const modifierAcces = useModifierAccesUtilisateur();
  const creerUtilisateur = useCreerUtilisateur();
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [brouillonsAcces, setBrouillonsAcces] = useState<
    Record<string, { role: RoleUtilisateur; etablissement_id: string }>
  >({});
  const [nouveauCompte, setNouveauCompte] = useState<{
    email: string;
    mot_de_passe: string;
    role: RoleUtilisateur;
    etablissement_id: string;
  }>({
    email: "",
    mot_de_passe: "",
    role: "ETABLISSEMENT",
    etablissement_id: "",
  });
  const [preferencesLocales, setPreferences] =
    useState<PreferencesCompte | null>(null);
  const preferences: PreferencesCompte = preferencesLocales ?? {
    theme: compte?.preferences?.theme ?? "SYSTEME",
    densite: compte?.preferences?.densite ?? "CONFORTABLE",
    animations: compte?.preferences?.animations ?? true,
    aide_contextuelle: compte?.preferences?.aide_contextuelle ?? true,
  };

  const emailNouveauCompteValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    nouveauCompte.email.trim(),
  );
  const motDePasseNouveauCompteValide = nouveauCompte.mot_de_passe.length >= 8;
  const etablissementNouveauCompteValide =
    nouveauCompte.role !== "ETABLISSEMENT" ||
    Boolean(nouveauCompte.etablissement_id);
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
    creerUtilisateur.mutate(
      {
        email: nouveauCompte.email.trim(),
        mot_de_passe: nouveauCompte.mot_de_passe,
        role: nouveauCompte.role,
        etablissement_id:
          nouveauCompte.role === "ETABLISSEMENT"
            ? nouveauCompte.etablissement_id
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Compte créé");
          setNouveauCompte({
            email: "",
            mot_de_passe: "",
            role: "ETABLISSEMENT",
            etablissement_id: "",
          });
          setCreationOuverte(false);
        },
        onError: (erreur) => toast.error(erreur.message),
      },
    );
  }

  const role = (compte?.role ??
    utilisateur?.role ??
    "DECIDEUR") as RoleUtilisateur;

  return (
    <div>
      <PageHeader
        titre="Paramètres du compte"
        description="Gérez la sécurité, l'interface et les droits d'accès de votre compte."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader titre="Informations et droits" />
          <PanelBody>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Champ
                libelle="E-mail"
                valeur={compte?.email ?? utilisateur?.email ?? "—"}
              />
              <Champ libelle="Rôle" valeur={LIBELLES_ROLES[role]} />
              <Champ
                libelle="Établissement"
                valeur={
                  compte?.etablissement_nom ??
                  utilisateur?.etablissement_nom ??
                  "Non rattaché"
                }
              />
              <Champ
                libelle="État du compte"
                valeur={compte?.actif === false ? "Désactivé" : "Actif"}
              />
            </dl>
            <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-[var(--color-brand)]" />{" "}
                Droits effectifs
              </div>
              <ul className="flex flex-col gap-2">
                {DROITS[role].map((droit) => (
                  <li
                    key={droit}
                    className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 text-[var(--color-brand)]" />
                    {droit}
                  </li>
                ))}
              </ul>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            titre="Préférences d'interface"
            sousTitre="Synchronisées avec votre compte"
          />
          <PanelBody className="flex flex-col gap-4">
            <PreferenceSelect
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
            <PreferenceSelect
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
            <PreferenceCase
              libelle="Animations d'interface"
              coche={preferences.animations ?? true}
              onChange={(animations) =>
                enregistrerPreferences({ ...preferences, animations })
              }
            />
            <PreferenceCase
              libelle="Aide contextuelle"
              coche={preferences.aide_contextuelle ?? true}
              onChange={(aide_contextuelle) =>
                enregistrerPreferences({ ...preferences, aide_contextuelle })
              }
            />
            {modifierPreferences.isPending ? (
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…
              </span>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            titre="Sécurité"
            sousTitre="Entre 8 et 72 caractères, avec une majuscule, une minuscule et un chiffre."
          />
          <PanelBody>
            <FormulaireMotDePasse />
          </PanelBody>
        </Panel>

        {estPresidence || etablissement ? (
          <Panel>
            <PanelHeader titre="Logo institutionnel" />
            <PanelBody>
              {estPresidence ? (
                <LogoUploader
                  endpoint="/configuration/logo"
                  logoUrl={configuration?.logo_url}
                  nom="Présidence"
                  queryKeys={[["configuration"], ["public", "configuration"]]}
                />
              ) : etablissement ? (
                <LogoUploader
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
            </PanelBody>
          </Panel>
        ) : null}
      </div>

      {estPresidence ? (
        <Panel className="mt-4">
          <PanelHeader
            titre="Utilisateurs et accès"
            sousTitre="Activez ou suspendez les comptes sans supprimer leur historique"
          />
          <PanelBody>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCreationOuverte((ouverte) => !ouverte)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" /> Nouveau compte
              </button>
            </div>
            {creationOuverte ? (
              <form
                onSubmit={soumettreNouveauCompte}
                className="mb-5 grid gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] p-4 md:grid-cols-2 xl:grid-cols-4"
              >
                <label className="flex flex-col gap-1 text-xs font-semibold">
                  Adresse e-mail
                  <input
                    type="email"
                    required
                    aria-invalid={
                      Boolean(nouveauCompte.email) && !emailNouveauCompteValide
                    }
                    value={nouveauCompte.email}
                    onChange={(event) =>
                      setNouveauCompte({
                        ...nouveauCompte,
                        email: event.target.value,
                      })
                    }
                    placeholder="partenariats@univ-fianarantsoa.mg"
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-normal"
                  />
                  {nouveauCompte.email && !emailNouveauCompteValide ? (
                    <span className="font-normal text-destructive">
                      Saisissez une adresse e-mail valide.
                    </span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold">
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
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-normal"
                  />
                  {nouveauCompte.mot_de_passe &&
                  !motDePasseNouveauCompteValide ? (
                    <span className="font-normal text-destructive">
                      Utilisez au moins 8 caractères.
                    </span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold">
                  Rôle
                  <select
                    value={nouveauCompte.role}
                    onChange={(event) =>
                      setNouveauCompte({
                        ...nouveauCompte,
                        role: event.target.value as RoleUtilisateur,
                        etablissement_id:
                          event.target.value === "ETABLISSEMENT"
                            ? nouveauCompte.etablissement_id
                            : "",
                      })
                    }
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-normal"
                  >
                    <option value="ETABLISSEMENT">Établissement</option>
                    <option value="DECIDEUR">Décideur</option>
                    <option value="PRESIDENCE">Présidence</option>
                  </select>
                </label>
                {nouveauCompte.role === "ETABLISSEMENT" ? (
                  <label className="flex flex-col gap-1 text-xs font-semibold">
                    Établissement
                    <select
                      required
                      aria-invalid={!etablissementNouveauCompteValide}
                      value={nouveauCompte.etablissement_id}
                      onChange={(event) =>
                        setNouveauCompte({
                          ...nouveauCompte,
                          etablissement_id: event.target.value,
                        })
                      }
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-normal"
                    >
                      <option value="">Sélectionnez…</option>
                      {etablissements.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nom}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span />
                )}
                <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                  <button
                    type="submit"
                    disabled={
                      creerUtilisateur.isPending || !nouveauCompteValide
                    }
                    className="rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {creerUtilisateur.isPending
                      ? "Création…"
                      : "Créer le compte"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationOuverte(false)}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase text-[var(--color-text-secondary)]">
                    <th className="py-2">Compte</th>
                    <th>Rôle</th>
                    <th>Établissement</th>
                    <th>Accès</th>
                  </tr>
                </thead>
                <tbody>
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
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--color-border)] last:border-0"
                      >
                        <td className="py-3 font-medium">
                          {item.email}
                          {estCompteCourant ? (
                            <span className="ml-2 text-[10px] text-[var(--color-text-secondary)]">
                              Vous
                            </span>
                          ) : null}
                        </td>
                        <td>
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
                            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs"
                          >
                            <option value="PRESIDENCE">Présidence</option>
                            <option value="ETABLISSEMENT">Établissement</option>
                            <option value="DECIDEUR">Décideur</option>
                          </select>
                        </td>
                        <td>
                          {acces.role === "ETABLISSEMENT" ? (
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
                              className="max-w-56 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs"
                            >
                              <option value="">Sélectionnez…</option>
                              {etablissements.map((etab) => (
                                <option key={etab.id} value={etab.id}>
                                  {etab.nom}
                                </option>
                              ))}
                            </select>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center gap-2">
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
                                className="rounded border border-[var(--color-brand)] px-2.5 py-1 text-xs font-semibold text-[var(--color-brand)] disabled:opacity-50"
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
                              onClick={() =>
                                modifierAcces.mutate(
                                  { id: item.id, actif: item.actif === false },
                                  {
                                    onError: (erreur) =>
                                      toast.error(erreur.message),
                                  },
                                )
                              }
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.actif === false ? "bg-[var(--status-attente-bg)] text-[var(--status-attente-fg)]" : "bg-[var(--status-actif-bg)] text-[var(--status-actif-fg)]"}`}
                            >
                              {item.actif === false
                                ? "Réactiver"
                                : "Désactiver"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PanelBody>
        </Panel>
      ) : null}
    </div>
  );
}

function Champ({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {libelle}
      </dt>
      <dd className="mt-1 text-[13.5px]">{valeur}</dd>
    </div>
  );
}

function PreferenceSelect({
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
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium">{libelle}</span>
      <select
        value={valeur}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs"
      >
        {options.map(([cle, texte]) => (
          <option key={cle} value={cle}>
            {texte}
          </option>
        ))}
      </select>
    </label>
  );
}

function PreferenceCase({
  libelle,
  coche,
  onChange,
}: {
  libelle: string;
  coche: boolean;
  onChange: (valeur: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium">{libelle}</span>
      <input
        type="checkbox"
        checked={coche}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-brand)]"
      />
    </label>
  );
}
