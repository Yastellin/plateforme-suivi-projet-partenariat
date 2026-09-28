// src/hooks/useDebounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(valeur: T, delaiMs: number): T {
  const [valeurDifferee, setValeurDifferee] = useState(valeur);

  useEffect(() => {
    const identifiant = window.setTimeout(() => setValeurDifferee(valeur), delaiMs);
    return () => window.clearTimeout(identifiant);
  }, [valeur, delaiMs]);

  return valeurDifferee;
}