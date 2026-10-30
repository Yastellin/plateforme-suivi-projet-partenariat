// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParametresCompte } from "@/features/comptes/pages/ParametresCompte";

const { creerUtilisateur } = vi.hoisted(() => ({
  creerUtilisateur: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    utilisateur: {
      id: "compte-presidence",
      email: "presidence@univ-fianarantsoa.mg",
      role: "PRESIDENCE",
      etablissement_id: null,
    },
  }),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ definirTheme: vi.fn() }),
}));

vi.mock("@/features/comptes/api/useCompte", () => ({
  useCompte: () => ({
    data: { email: "presidence@univ-fianarantsoa.mg", role: "PRESIDENCE" },
  }),
  useConfigurationInstitutionnelle: () => ({ data: undefined }),
  useModifierPreferences: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/features/comptes/api/useUtilisateurs", () => ({
  useCreerUtilisateur: () => ({ isPending: false, mutate: creerUtilisateur }),
  useModifierAccesUtilisateur: () => ({ isPending: false, mutate: vi.fn() }),
  useUtilisateurs: () => ({
    data: [
      {
        id: "compte-presidence",
        email: "presidence@univ-fianarantsoa.mg",
        role: "PRESIDENCE",
        actif: true,
        etablissement_id: null,
      },
      {
        id: "compte-decideur",
        email: "decideur@univ-fianarantsoa.mg",
        role: "DECIDEUR",
        actif: true,
        etablissement_id: null,
      },
      {
        id: "compte-etablissement",
        email: "fds@univ-fianarantsoa.mg",
        role: "ETABLISSEMENT",
        actif: true,
        etablissement_id: "etab-existant",
      },
    ],
  }),
}));

vi.mock("@/features/etablissements/api/useEtablissement", () => ({
  useEtablissement: () => ({ data: undefined }),
}));

vi.mock("@/features/etablissements/api/useEtablissements", () => ({
  useEtablissements: () => ({
    data: { data: [{ id: "etab-existant", nom: "Établissement existant" }] },
  }),
}));

vi.mock("@/features/comptes/components/FormulaireMotDePasse", () => ({
  FormulaireMotDePasse: () => null,
}));

vi.mock("@/components/shared/LogoUploader", () => ({
  LogoUploader: () => null,
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  creerUtilisateur.mockClear();
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

async function saisir(champ: HTMLInputElement, valeur: string) {
  const definirValeur = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    definirValeur.call(champ, valeur);
    champ.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function choisir(selecteur: HTMLSelectElement, valeur: string) {
  const definirValeur = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    definirValeur.call(selecteur, valeur);
    selecteur.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("création d'un compte établissement", () => {
  it("saisit un nom en texte et envoie le nom sans identifiant d'établissement", async () => {
    await act(async () => racine.render(createElement(ParametresCompte)));

    const boutonNouveauCompte = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Nouveau compte"))!;
    await act(async () => boutonNouveauCompte.click());

    const formulaire = conteneur.querySelector<HTMLFormElement>("form")!;
    const champEtablissement = formulaire.querySelector<HTMLInputElement>(
      "#nouveau-compte-etablissement-nom",
    )!;
    expect(champEtablissement.type).toBe("text");
    expect(champEtablissement.getAttribute("aria-describedby")).toBe(
      "aide-nouvel-etablissement",
    );
    expect(formulaire.querySelector('input[type="email"]')?.placeholder).toBe(
      "partenariats@univ-fianarantsoa.mg",
    );

    await saisir(
      formulaire.querySelector<HTMLInputElement>('input[type="email"]')!,
      "nouveau.compte@univ-fianarantsoa.mg",
    );
    await saisir(
      formulaire.querySelector<HTMLInputElement>('input[type="password"]')!,
      "MotDePasse1",
    );
    await saisir(champEtablissement, " ÉTABLISSEMENT   EXISTANT ");

    const boutonCreer = Array.from(
      formulaire.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Créer le compte"))!;
    expect(
      formulaire.querySelector("#erreur-nouvel-etablissement")?.textContent,
    ).toContain("Cet établissement est déjà enregistré");
    expect(boutonCreer.disabled).toBe(true);

    await saisir(champEtablissement, "Nouvel établissement universitaire");
    expect(formulaire.querySelector("#erreur-nouvel-etablissement")).toBeNull();
    expect(boutonCreer.disabled).toBe(false);
    await act(async () => boutonCreer.click());

    expect(creerUtilisateur).toHaveBeenCalledOnce();
    expect(creerUtilisateur.mock.calls[0][0]).toEqual({
      email: "nouveau.compte@univ-fianarantsoa.mg",
      mot_de_passe: "MotDePasse1",
      role: "ETABLISSEMENT",
      etablissement_nom: "Nouvel établissement universitaire",
    });
  });

  it.each([
    {
      role: "PRESIDENCE",
      email: "nouvelle.presidence@univ-fianarantsoa.mg",
    },
    {
      role: "DECIDEUR",
      email: "nouveau.decideur@univ-fianarantsoa.mg",
    },
  ])("permet de créer un compte $role sans établissement", async ({ role, email }) => {
    await act(async () => racine.render(createElement(ParametresCompte)));

    const boutonNouveauCompte = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Nouveau compte"))!;
    await act(async () => boutonNouveauCompte.click());

    const formulaire = conteneur.querySelector<HTMLFormElement>("form")!;
    await choisir(
      formulaire.querySelector<HTMLSelectElement>("select")!,
      role,
    );
    expect(
      formulaire.querySelector("#nouveau-compte-etablissement-nom"),
    ).toBeNull();
    await saisir(
      formulaire.querySelector<HTMLInputElement>('input[type="email"]')!,
      email,
    );
    await saisir(
      formulaire.querySelector<HTMLInputElement>('input[type="password"]')!,
      "MotDePasse1",
    );

    const boutonCreer = Array.from(
      formulaire.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Créer le compte"))!;
    expect(boutonCreer.disabled).toBe(false);
    await act(async () => boutonCreer.click());

    expect(creerUtilisateur.mock.calls[0][0]).toEqual({
      email,
      mot_de_passe: "MotDePasse1",
      role,
    });
  });

  it("bloque les adresses déjà utilisées par tous les types de compte", async () => {
    await act(async () => racine.render(createElement(ParametresCompte)));

    const boutonNouveauCompte = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Nouveau compte"))!;
    await act(async () => boutonNouveauCompte.click());

    const formulaire = conteneur.querySelector<HTMLFormElement>("form")!;
    const champEmail = formulaire.querySelector<HTMLInputElement>(
      'input[type="email"]',
    )!;
    const selectRole = formulaire.querySelector<HTMLSelectElement>("select")!;
    const boutonCreer = Array.from(
      formulaire.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) => bouton.textContent?.includes("Créer le compte"))!;
    const comptesExistants = [
      {
        role: "PRESIDENCE",
        email: "PRESIDENCE@UNIV-FIANARANTSOA.MG",
        libelle: "Présidence",
      },
      {
        role: "DECIDEUR",
        email: "decideur@univ-fianarantsoa.mg",
        libelle: "Décideur",
      },
      {
        role: "ETABLISSEMENT",
        email: "fds@univ-fianarantsoa.mg",
        libelle: "Établissement",
      },
    ];

    for (const compte of comptesExistants) {
      await choisir(selectRole, compte.role);
      await saisir(champEmail, compte.email);
      expect(
        formulaire.querySelector("#erreur-nouvel-email")?.textContent,
      ).toContain(`compte ${compte.libelle}`);
      expect(boutonCreer.disabled).toBe(true);
    }
  });
});
