// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PartenaireCreatePage } from "@/features/partenaires/pages/PartenaireCreatePage";

const etat = vi.hoisted(() => ({
  recherche: "",
  verification: undefined as unknown,
  callbacksMutation: undefined as
    undefined | { onError: (erreur: Error) => void },
  formProps: undefined as
    undefined | { nomInitial?: string; onSoumettre: (valeurs: any) => void },
  toastErreur: vi.fn(),
  creerPartenaire: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: etat.toastErreur, success: vi.fn() },
}));
vi.mock("react-router-dom", async () => {
  const React = await import("react");
  return {
    Link: ({ children, to, ...props }: any) =>
      React.createElement("a", { ...props, href: to }, children),
    useNavigate: () => etat.navigate,
    useSearchParams: () => [new URLSearchParams(etat.recherche)],
  };
});
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ utilisateur: { role: "PRESIDENCE" } }),
}));
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (valeur: string) => valeur,
}));
vi.mock("@/features/partenaires/api/useVerificationNomPartenaire", () => ({
  useVerificationNomPartenaire: () => ({
    data: etat.verification,
    isFetching: false,
    isError: false,
    errorUpdatedAt: 0,
  }),
}));
vi.mock("@/features/partenaires/api/useCreatePartenaire", () => ({
  useCreatePartenaire: () => ({
    isPending: false,
    mutate: (_variables: unknown, callbacks: any) => {
      etat.creerPartenaire(_variables, callbacks);
      etat.callbacksMutation = callbacks;
    },
  }),
}));
vi.mock("@/features/partenaires/components/PartenaireForm", async () => {
  const React = await import("react");
  return {
    PartenaireForm: (props: any) => {
      etat.formProps = props;
      return React.createElement(
        "div",
        { "data-testid": "formulaire-partenaire" },
        React.createElement("p", null, `Nom prérempli : ${props.nomInitial}`),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => props.onSoumettre({ nom: props.nomInitial }),
          },
          "Tester la soumission",
        ),
      );
    },
  };
});
vi.mock("@/components/ui/button", async () => {
  const React = await import("react");
  return {
    Button: ({ children, variant: _variant, ...props }: any) =>
      React.createElement("button", props, children),
  };
});
vi.mock("@/components/ui/input", async () => {
  const React = await import("react");
  return { Input: (props: any) => React.createElement("input", props) };
});
vi.mock("@/components/ui/label", async () => {
  const React = await import("react");
  return { Label: (props: any) => React.createElement("label", props) };
});
vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");
  const wrapper =
    (tag: string) =>
    ({ children, ...props }: any) =>
      React.createElement(tag, props, children);
  return {
    Dialog: ({ open, children }: any) =>
      open
        ? React.createElement("div", { "data-testid": "dialogue" }, children)
        : null,
    DialogClose: ({ children }: any) => children,
    DialogContent: ({
      children,
      showCloseButton: _showCloseButton,
      ...props
    }: any) => React.createElement("section", props, children),
    DialogDescription: wrapper("p"),
    DialogFooter: wrapper("footer"),
    DialogHeader: wrapper("header"),
    DialogTitle: wrapper("h2"),
  };
});
vi.mock("@/components/shared/PageHeader", async () => {
  const React = await import("react");
  return {
    PageHeader: ({ titre }: any) => React.createElement("h1", null, titre),
  };
});
vi.mock("@/components/shared/Panel", async () => {
  const React = await import("react");
  return {
    Panel: ({ children }: any) =>
      React.createElement("section", null, children),
    PanelBody: ({ children }: any) =>
      React.createElement("div", null, children),
  };
});

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  etat.recherche = "";
  etat.verification = undefined;
  etat.callbacksMutation = undefined;
  etat.formProps = undefined;
  etat.toastErreur.mockReset();
  etat.creerPartenaire.mockReset();
  etat.navigate.mockReset();
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe("vérification de nom avant création du partenaire", () => {
  it("bloque la création d’un doublon exact et propose sa fiche visible", async () => {
    etat.recherche = "nom=Université+d%27Antananarivo";
    etat.verification = {
      doublon_exact: true,
      correspondants: [
        {
          id: "partenaire-existant",
          nom: "Université d’Antananarivo",
          pays: "Madagascar",
          type: "Université",
        },
      ],
      similaires: [],
    };

    await act(async () => racine.render(createElement(PartenaireCreatePage)));

    expect(conteneur.textContent).toContain(
      "Un partenaire portant ce nom existe déjà.",
    );
    expect(conteneur.querySelector("a")?.getAttribute("href")).toBe(
      "/presidence/partenaires-partenariats/partenaires/partenaire-existant",
    );
    const continuer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent === "Continuer",
    ) as HTMLButtonElement;
    expect(continuer.disabled).toBe(true);
  });

  it("signale les noms proches mais permet de continuer avec le nom saisi", async () => {
    etat.recherche = "nom=Universite+d%27Antananariv";
    etat.verification = {
      doublon_exact: false,
      correspondants: [],
      similaires: [
        {
          id: "partenaire-proche",
          nom: "Université d’Antananarivo",
          pays: "Madagascar",
          type: "Université",
          similarite: 96,
        },
      ],
    };

    await act(async () => racine.render(createElement(PartenaireCreatePage)));

    expect(conteneur.textContent).toContain(
      "Des noms proches ont été trouvés.",
    );
    expect(conteneur.textContent).toContain(
      "Aucun doublon exact : vous pouvez continuer.",
    );
    const continuer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent === "Continuer",
    ) as HTMLButtonElement;
    expect(continuer.disabled).toBe(false);

    await act(async () => continuer.click());
    expect(conteneur.textContent).toContain(
      "Nom prérempli : Universite d'Antananariv",
    );
  });

  it("traduit le conflit 409 sans changer le parcours de création du wizard", async () => {
    etat.recherche = "retour=wizard-partenariat";

    await act(async () => racine.render(createElement(PartenaireCreatePage)));
    expect(conteneur.querySelector('[data-testid="dialogue"]')).toBeNull();
    expect(
      conteneur.querySelector('[data-testid="formulaire-partenaire"]'),
    ).not.toBeNull();

    await act(async () => {
      (conteneur.querySelector("button") as HTMLButtonElement).click();
    });
    await act(async () => {
      etat.callbacksMutation?.onError(
        new Error("Un partenaire portant le nom « Exemple » existe déjà."),
      );
    });

    expect(etat.toastErreur).toHaveBeenCalledWith(
      "Ce partenaire existe déjà. Ouvrez sa fiche ou vérifiez le nom avant de réessayer.",
    );
  });
});
