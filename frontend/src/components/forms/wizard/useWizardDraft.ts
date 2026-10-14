// src/components/forms/wizard/useWizardDraft.ts

import { useEffect, useRef } from 'react';

const INTERVALLE_SAUVEGARDE_MS = 30000;

interface OptionsWizardDraft<T> {
  cle: string;
  valeurs?: T;
  donnees?: T;
  actif?: boolean;
  onRestaurer?: (valeurs: T) => void;
}

export function useWizardDraft<T>({ cle, valeurs, donnees, actif = true, onRestaurer }: OptionsWizardDraft<T>): { effacerBrouillon: () => void; viderBrouillon: () => void } {
  const valeursActuelles = valeurs ?? donnees ?? ({} as T);
  const onRestaurerRef = useRef(onRestaurer ?? (() => undefined));
  onRestaurerRef.current = onRestaurer ?? (() => undefined);

  const valeursRef = useRef(valeursActuelles);
  valeursRef.current = valeursActuelles;

  useEffect(() => {
    const brouillon = window.localStorage.getItem(cle);
    if (brouillon) {
      try {
        onRestaurerRef.current(JSON.parse(brouillon) as T);
      } catch {
        window.localStorage.removeItem(cle);
      }
    }
    // Restauration au montage uniquement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  useEffect(() => {
    if (!actif) {
      return;
    }

    const intervalle = window.setInterval(() => {
      window.localStorage.setItem(cle, JSON.stringify(valeursRef.current));
    }, INTERVALLE_SAUVEGARDE_MS);

    return () => window.clearInterval(intervalle);
  }, [cle, actif]);

  function effacerBrouillon() {
    window.localStorage.removeItem(cle);
  }

  return { effacerBrouillon, viderBrouillon: effacerBrouillon };
}