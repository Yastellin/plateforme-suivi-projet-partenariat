/** @vitest-environment jsdom */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useRevealOnScroll,
  type DirectionReveal,
} from "@/hooks/useRevealOnScroll";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

class ObservateurIntersectionSimule {
  static instances: ObservateurIntersectionSimule[] = [];
  readonly seuil: IntersectionObserverInit["threshold"];
  private readonly callback: IntersectionObserverCallback;
  readonly observer = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.seuil = options?.threshold;
    ObservateurIntersectionSimule.instances.push(this);
  }

  observe = (element: Element) => this.observer.observe(element);
  unobserve = (element: Element) => this.observer.unobserve(element);
  disconnect = () => this.observer.disconnect();

  emettre(ratio: number, visible: boolean) {
    this.callback(
      [
        {
          isIntersecting: visible,
          intersectionRatio: ratio,
          target: document.createElement("div"),
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function Sonde({ direction = "up" }: { direction?: DirectionReveal }) {
  const reveal = useRevealOnScroll(direction);
  return createElement("div", {
    ref: reveal.ref,
    "data-visible": String(reveal.visible),
    style: reveal.style,
  });
}

describe("useRevealOnScroll", () => {
  let conteneur: HTMLDivElement;
  let racine: Root;
  let ancienneMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    ObservateurIntersectionSimule.instances = [];
    ancienneMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(
        () =>
          ({
            matches: false,
            media: "(prefers-reduced-motion: reduce)",
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }) as unknown as MediaQueryList,
      ),
    });
    vi.stubGlobal(
      "IntersectionObserver",
      ObservateurIntersectionSimule as unknown as typeof IntersectionObserver,
    );
    conteneur = document.createElement("div");
    document.body.append(conteneur);
    racine = createRoot(conteneur);
  });

  afterEach(async () => {
    await act(async () => racine.unmount());
    conteneur.remove();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: ancienneMatchMedia,
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("observe au seuil 0,15 et révèle l’élément après intersection", async () => {
    await act(async () => racine.render(createElement(Sonde)));
    const sonde = conteneur.firstElementChild as HTMLDivElement;
    const observateur = ObservateurIntersectionSimule.instances[0];

    expect(observateur.seuil).toBe(0.15);
    expect(sonde.dataset.visible).toBe("false");
    expect(sonde.style.opacity).toBe("0");
    expect(sonde.style.transform).toBe("translate3d(0, 24px, 0)");

    await act(async () => observateur.emettre(0.14, true));
    expect(sonde.dataset.visible).toBe("false");

    await act(async () => observateur.emettre(0.15, true));
    expect(sonde.dataset.visible).toBe("true");
    expect(observateur.observer.unobserve).toHaveBeenCalled();
  });

  it("applique la direction choisie et n’anime pas si le mouvement est réduit", async () => {
    await act(async () =>
      racine.render(createElement(Sonde, { direction: "left" })),
    );
    const sonde = conteneur.firstElementChild as HTMLDivElement;
    expect(sonde.style.transform).toBe("translate3d(-24px, 0, 0)");

    await act(async () => racine.unmount());
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(
        () =>
          ({
            matches: true,
            media: "(prefers-reduced-motion: reduce)",
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }) as unknown as MediaQueryList,
      ),
    });
    racine = createRoot(conteneur);
    await act(async () =>
      racine.render(createElement(Sonde, { direction: "right" })),
    );

    const sondeSansMouvement = conteneur.firstElementChild as HTMLDivElement;
    expect(sondeSansMouvement.dataset.visible).toBe("true");
    expect(sondeSansMouvement.style.opacity).toBe("1");
    expect(sondeSansMouvement.style.transition).toBe("none");
    expect(ObservateurIntersectionSimule.instances).toHaveLength(1);
  });
});
