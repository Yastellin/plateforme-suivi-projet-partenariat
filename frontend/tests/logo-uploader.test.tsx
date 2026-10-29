// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ post: vi.fn(), delete: vi.fn() }));
const notifications = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({ default: api }));
vi.mock("sonner", () => ({ toast: notifications }));

import { LogoUploader } from "@/components/shared/LogoUploader";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;
let queryClient: QueryClient;
const creerObjectUrl = vi.fn(() => "blob:https://partenariats.mg/apercu");
const revoquerObjectUrl = vi.fn();

beforeEach(() => {
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  api.post.mockReset();
  api.delete.mockReset();
  notifications.success.mockReset();
  notifications.error.mockReset();
  creerObjectUrl.mockClear();
  revoquerObjectUrl.mockClear();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: creerObjectUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revoquerObjectUrl,
  });
});

afterEach(async () => {
  await act(async () => racine.unmount());
  queryClient.clear();
  conteneur.remove();
});

describe("LogoUploader", () => {
  it("conserve le logo renvoyé par l'API après le retrait de l'aperçu local", async () => {
    let terminerUpload!: (valeur: {
      data: { logo_url: string };
    }) => void;
    api.post.mockReturnValue(
      new Promise((resolve) => {
        terminerUpload = resolve;
      }),
    );

    await act(async () => {
      racine.render(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(LogoUploader, {
            endpoint: "/partenaires/partenaire-toliara/logo",
            logoUrl: null,
            nom: "Université de Toliara",
            queryKeys: [["partenaires", "partenaire-toliara"]],
          }),
        ),
      );
    });

    const fichier = new File(["logo"], "logo-toliara.png", {
      type: "image/png",
    });
    const input = conteneur.querySelector("input[type=file]") as HTMLInputElement;

    await act(async () => {
      Object.defineProperty(input, "files", {
        configurable: true,
        value: [fichier],
      });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(conteneur.querySelector("img")?.getAttribute("src")).toBe(
      "blob:https://partenariats.mg/apercu",
    );
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post.mock.calls[0][0]).toBe(
      "/partenaires/partenaire-toliara/logo",
    );
    expect((api.post.mock.calls[0][1] as FormData).get("fichier")).toBe(
      fichier,
    );

    await act(async () => {
      terminerUpload({
        data: {
          logo_url:
            "/uploads/logos/partenaires/partenaire-toliara/logo.png",
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(conteneur.querySelector("img")?.getAttribute("src")).toBe(
      "/api/uploads/logos/partenaires/partenaire-toliara/logo.png",
    );
    expect(conteneur.textContent).toContain("Remplacer le logo");
    expect(notifications.success).toHaveBeenCalledWith("Logo mis à jour");
    expect(revoquerObjectUrl).toHaveBeenCalledWith(
      "blob:https://partenariats.mg/apercu",
    );
  });

  it("retire un logo existant après confirmation", async () => {
    api.delete.mockResolvedValue({ data: { logo_url: null } });

    await act(async () => {
      racine.render(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(LogoUploader, {
            endpoint: "/configuration/logo",
            logoUrl: "/uploads/logo-presidence.png",
            nom: "Présidence",
          }),
        ),
      );
    });

    const boutonRetirer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent?.trim() === "Retirer le logo",
    );
    expect(boutonRetirer).toBeDefined();

    await act(async () => boutonRetirer?.click());
    const boutonsDialogue = Array.from(document.body.querySelectorAll("button"));
    const confirmer = boutonsDialogue.find(
      (bouton) =>
        bouton.textContent?.trim() === "Retirer le logo" &&
        bouton.className.includes("text-white"),
    );
    expect(confirmer).toBeDefined();

    await act(async () => confirmer?.click());

    expect(api.delete).toHaveBeenCalledWith("/configuration/logo");
    expect(notifications.success).toHaveBeenCalledWith("Logo retiré");
    expect(conteneur.textContent).toContain("Ajouter un logo");
  });
});
