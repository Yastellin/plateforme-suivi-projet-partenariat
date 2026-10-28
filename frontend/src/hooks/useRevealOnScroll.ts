import { useEffect, useRef, useState, type CSSProperties } from "react";

export type DirectionReveal = "up" | "left" | "right";

interface OptionsReveal {
  enabled?: boolean;
}

interface EtatReveal<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  visible: boolean;
  mouvementReduit: boolean;
  style: CSSProperties;
  revelerImmediatement: () => void;
}

const SEUIL_VISIBILITE = 0.15;
const DISTANCE_DEPART = 24;
const MEDIA_REDUIT = "(prefers-reduced-motion: reduce)";

function preferenceMouvementReduit(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(MEDIA_REDUIT).matches
  );
}

function transformationDepart(direction: DirectionReveal): string {
  if (direction === "up") return `translate3d(0, ${DISTANCE_DEPART}px, 0)`;
  if (direction === "left") return `translate3d(-${DISTANCE_DEPART}px, 0, 0)`;
  return `translate3d(${DISTANCE_DEPART}px, 0, 0)`;
}

/** Révèle un élément au seuil d'intersection avec la direction choisie. */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  direction: DirectionReveal = "up",
  { enabled = true }: OptionsReveal = {},
): EtatReveal<T> {
  const ref = useRef<T>(null);
  const [mouvementReduit, setMouvementReduit] = useState(
    preferenceMouvementReduit,
  );
  const [visible, setVisible] = useState(
    () =>
      preferenceMouvementReduit() ||
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const media = window.matchMedia(MEDIA_REDUIT);
    const synchroniser = (evenement: MediaQueryListEvent | MediaQueryList) => {
      setMouvementReduit(evenement.matches);
      if (evenement.matches) setVisible(true);
    };
    synchroniser(media);
    media.addEventListener?.("change", synchroniser);
    return () => media.removeEventListener?.("change", synchroniser);
  }, []);

  useEffect(() => {
    if (!enabled || visible || mouvementReduit) return;
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (
          entree.isIntersecting &&
          entree.intersectionRatio >= SEUIL_VISIBILITE
        ) {
          setVisible(true);
          observateur.unobserve(entree.target);
        }
      },
      { threshold: SEUIL_VISIBILITE },
    );
    observateur.observe(element);
    return () => observateur.disconnect();
  }, [enabled, mouvementReduit, visible]);

  function revelerImmediatement() {
    setVisible(true);
  }

  const style: CSSProperties = {
    opacity: visible || mouvementReduit ? 1 : 0,
    transform:
      visible || mouvementReduit
        ? "translate3d(0, 0, 0)"
        : transformationDepart(direction),
    transition: mouvementReduit
      ? "none"
      : "opacity 450ms ease, transform 450ms ease",
    willChange: visible || mouvementReduit ? undefined : "opacity, transform",
  };

  return {
    ref,
    visible: visible || mouvementReduit,
    mouvementReduit,
    style,
    revelerImmediatement,
  };
}
