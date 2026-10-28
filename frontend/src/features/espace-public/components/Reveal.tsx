import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  useRevealOnScroll,
  type DirectionReveal,
} from "@/hooks/useRevealOnScroll";

interface ContexteGroupeReveal {
  direction: DirectionReveal;
  visible: boolean;
  mouvementReduit: boolean;
  revelerImmediatement: () => void;
}

interface ProprietesRevealItem {
  children: ReactNode;
  className?: string;
  direction?: DirectionReveal;
  delai?: number;
}

const ContexteGroupe = createContext<ContexteGroupeReveal | null>(null);
const DISTANCE_DEPART = 24;

function transformationDepart(direction: DirectionReveal): string {
  if (direction === "up") return `translate3d(0, ${DISTANCE_DEPART}px, 0)`;
  if (direction === "left") return `translate3d(-${DISTANCE_DEPART}px, 0, 0)`;
  return `translate3d(${DISTANCE_DEPART}px, 0, 0)`;
}

function styleReveal(
  visible: boolean,
  mouvementReduit: boolean,
  direction: DirectionReveal,
  delai: string,
): CSSProperties {
  return {
    opacity: visible || mouvementReduit ? 1 : 0,
    transform:
      visible || mouvementReduit
        ? "translate3d(0, 0, 0)"
        : transformationDepart(direction),
    transition: mouvementReduit
      ? "none"
      : "opacity 450ms ease, transform 450ms ease",
    transitionDelay: mouvementReduit ? "0ms" : delai,
    willChange: visible || mouvementReduit ? undefined : "opacity, transform",
  };
}

interface ProprietesReveal {
  children: ReactNode;
  className?: string;
  delai?: number;
  direction?: DirectionReveal;
}

export function Reveal({
  children,
  className,
  delai = 0,
  direction = "up",
}: ProprietesReveal) {
  const { ref, visible, mouvementReduit, revelerImmediatement } =
    useRevealOnScroll(direction);
  return (
    <div
      ref={ref}
      className={className}
      style={styleReveal(visible, mouvementReduit, direction, `${delai}s`)}
      data-reveal-visible={visible}
      onFocusCapture={revelerImmediatement}
    >
      {children}
    </div>
  );
}

export function RevealGroup({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: DirectionReveal;
}) {
  const { ref, visible, mouvementReduit, revelerImmediatement } =
    useRevealOnScroll(direction);
  const echelonnes = Children.map(children, (enfant, index) => {
    if (!isValidElement<ProprietesRevealItem>(enfant)) return enfant;
    return cloneElement(enfant, {
      delai: enfant.props.delai ?? index * 100,
    });
  });
  const contexte = {
    direction,
    visible,
    mouvementReduit,
    revelerImmediatement,
  };

  return (
    <ContexteGroupe.Provider value={contexte}>
      <div
        ref={ref}
        className={className}
        data-reveal-group=""
        data-reveal-visible={visible}
        onFocusCapture={revelerImmediatement}
      >
        {echelonnes}
      </div>
    </ContexteGroupe.Provider>
  );
}

export function RevealItem({
  children,
  className,
  direction,
  delai = 0,
}: ProprietesRevealItem) {
  const groupe = useContext(ContexteGroupe);
  const directionEffective = direction ?? groupe?.direction ?? "up";
  const {
    ref,
    visible: visibleLocale,
    mouvementReduit: mouvementReduitLocal,
    revelerImmediatement,
  } = useRevealOnScroll(directionEffective, { enabled: !groupe });
  const visible = groupe?.visible ?? visibleLocale;
  const mouvementReduit = groupe?.mouvementReduit ?? mouvementReduitLocal;
  const delaiCss = groupe ? `${delai}ms` : `${delai}s`;

  return (
    <div
      ref={groupe ? undefined : ref}
      className={className}
      style={styleReveal(
        visible,
        mouvementReduit,
        directionEffective,
        delaiCss,
      )}
      data-reveal-item=""
      data-reveal-visible={visible}
      onFocusCapture={groupe?.revelerImmediatement ?? revelerImmediatement}
    >
      {children}
    </div>
  );
}
