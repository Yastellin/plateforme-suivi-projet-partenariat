// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BarreInfoPublique } from "@/components/layout/BarreInfoPublique";
import { BoutonContactFlottant } from "@/components/layout/BoutonContactFlottant";
import { FooterPublique } from "@/components/layout/FooterPublique";
import { TopbarPublique } from "@/components/layout/TopbarPublique";
import { COORDONNEES_PUBLIQUES } from "@/features/espace-public/lib/coordonneesPubliques";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function Harness() {
  const location = useLocation();
  return (
    <>
      <BarreInfoPublique />
      <TopbarPublique />
      <output data-testid="chemin">{location.pathname}</output>
      <FooterPublique />
      <BoutonContactFlottant />
    </>
  );
}

let conteneur: HTMLDivElement;
let racine: Root;

async function monter(chemin: string) {
  conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  racine = createRoot(conteneur);
  await act(async () => {
    racine.render(
      createElement(
        MemoryRouter,
        { initialEntries: [chemin] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: "*", element: createElement(Harness) }),
        ),
      ),
    );
  });
  return conteneur;
}

beforeEach(() => {
  window.matchMedia = (requete: string) =>
    ({
      matches: false,
      media: requete,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

afterEach(async () => {
  await act(async () => racine.unmount());
  conteneur.remove();
});

describe("navigation publique partenaires et partenariats", () => {
  it("expose deux liens distincts avec les bonnes destinations et sans accès interne", async () => {
    const page = await monter("/");
    const lienPartenaires = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenaires"]',
    );
    const lienPartenariats = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenariats"]',
    );

    expect(lienPartenaires?.textContent).toContain("Partenaires");
    expect(lienPartenariats?.textContent).toContain("Partenariats");
    expect(page.querySelector('a[href="/connexion"]')).toBeNull();
    expect(page.querySelector('footer a[href="/connexion"]')).toBeNull();
  });

  it("affiche les coordonnées dans la barre supérieure et le CTA flottant", async () => {
    const page = await monter("/")

    expect(page.querySelector(".vt-info-top-nom")?.textContent).toBe("Université de Fianarantsoa")
    expect(page.querySelector(`.vt-info-top a[href="mailto:${COORDONNEES_PUBLIQUES.courriel}"]`)).not.toBeNull()
    expect(page.querySelector(`.vt-info-top a[href="tel:${COORDONNEES_PUBLIQUES.telephoneLien}"]`)).not.toBeNull()
    expect(COORDONNEES_PUBLIQUES.courriel).toBe("contact@uf.mg")
    expect(COORDONNEES_PUBLIQUES.telephone).toBe("+261 34 00 00 00")
    expect(page.querySelector(".vt-info-facebook")?.textContent).toBe("Facebook")
    expect(page.querySelector('.vt-contact-flottant[href="/contact"]')?.textContent).toContain("Nous contacter")
  })

  it("reprend la navigation publique et le pied de page en quatre colonnes", async () => {
    const page = await monter("/")
    const nav = page.querySelector(".vt-nav")!
    const liens = [...nav.querySelectorAll("a")].map((lien) => lien.textContent?.trim())

    expect(liens).toEqual(["Accueil", "Actualités", "Projets", "Partenariats", "Partenaires", "Établissements", "Contact"])
    expect(nav.querySelectorAll(".vt-nav-chevron")).toHaveLength(2)
    expect(page.querySelectorAll(".vt-footer-cols > div")).toHaveLength(4)
    expect(page.querySelector("footer")?.textContent).toContain("BP 1264")
    expect(page.querySelector("footer")?.textContent).toContain("LinkedIn")
    expect(page.querySelector("footer")?.textContent).toContain("YouTube")
  })

  it("met à jour la page active et ferme le menu mobile après navigation", async () => {
    const page = await monter("/partenaires");
    const boutonMenu = page.querySelector<HTMLButtonElement>(".vt-menu-btn")!;

    await act(async () => boutonMenu.click());
    expect(boutonMenu.getAttribute("aria-expanded")).toBe("true");

    const lienPartenariats = page.querySelector<HTMLAnchorElement>(
      'nav a[href="/partenariats"]',
    )!;
    await act(async () => lienPartenariats.click());

    expect(page.querySelector('[data-testid="chemin"]')?.textContent).toBe(
      "/partenariats",
    );
    expect(boutonMenu.getAttribute("aria-expanded")).toBe("false");
    expect(
      page.querySelector('nav a[aria-current="page"]')?.getAttribute("href"),
    ).toBe("/partenariats");
  });

  it("propose les deux destinations dans le footer sans lien interne", async () => {
    const page = await monter("/");
    const footer = page.querySelector("footer")!;

    expect(
      footer.querySelector('a[href="/partenaires"]')?.textContent,
    ).toContain("Partenaires");
    expect(
      footer.querySelector('a[href="/partenariats"]')?.textContent,
    ).toContain("Partenariats");
    expect(footer.querySelector('a[href="/connexion"]')).toBeNull();
  });

  it("conserve des liens de footer tabulables et exclusivement publics", async () => {
    const page = await monter("/");
    const liens = [...page.querySelectorAll<HTMLAnchorElement>("footer a")];

    expect(liens.length).toBeGreaterThan(0);
    for (const lien of liens) {
      expect(lien.tabIndex).toBeGreaterThanOrEqual(0);
      expect(lien.getAttribute("href")).not.toMatch(
        /connexion|espace-interne|dashboard/,
      );
      lien.focus();
      expect(document.activeElement).toBe(lien);
    }
  });
});
