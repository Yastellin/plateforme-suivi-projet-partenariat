import { createContext, useContext } from "react";

export const NOM_INSTITUTION = "Université de Fianarantsoa";

export interface IdentiteVisuelleContextValue {
  logoUrl: string | null;
}

export const IdentiteVisuelleContext =
  createContext<IdentiteVisuelleContextValue>({ logoUrl: null });

export function useIdentiteVisuelle(): IdentiteVisuelleContextValue {
  return useContext(IdentiteVisuelleContext);
}
