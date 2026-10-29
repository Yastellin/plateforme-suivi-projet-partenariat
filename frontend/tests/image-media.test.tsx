// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LogoMedia } from "@/components/shared/ImageMedia";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let conteneur: HTMLDivElement;
let racine: Root;

beforeEach(() => {
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe("ImageMedia", () => {
  it("essaie le chemin historique puis retire un logo indisponible", async () => {
    await act(async () => {
      racine.render(
        createElement(LogoMedia, {
          src: "/uploads/logos/etablissements/uf.png",
          nom: "Université de Toliara",
        }),
      );
    });

    const image = conteneur.querySelector("img");
    expect(image?.getAttribute("src")).toBe(
      "/api/uploads/logos/etablissements/uf.png",
    );

    await act(async () => {
      image?.dispatchEvent(new Event("error"));
    });

    const imageHistorique = conteneur.querySelector("img");
    expect(imageHistorique?.getAttribute("src")).toBe(
      "/uploads/logos/etablissements/uf.png",
    );

    await act(async () => {
      imageHistorique?.dispatchEvent(new Event("error"));
    });

    expect(conteneur.querySelector("img")).toBeNull();
    expect(conteneur.textContent).toBe("");
    expect(conteneur.querySelector('[role="img"]')).toBeNull();
  });
});
