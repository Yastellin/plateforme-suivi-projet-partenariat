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
  it("résout le média via l'API et remplace une image cassée par les initiales", async () => {
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

    expect(conteneur.querySelector("img")).toBeNull();
    expect(conteneur.textContent).toContain("UT");
    expect(
      conteneur.querySelector(
        '[aria-label="Logo de Université de Toliara indisponible"]',
      ),
    ).not.toBeNull();
  });
});
