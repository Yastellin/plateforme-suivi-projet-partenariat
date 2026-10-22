import type { ComponentProps } from "react";

import { LogoMedia } from "@/components/shared/ImageMedia";
import {
  NOM_INSTITUTION,
  useIdentiteVisuelle,
} from "@/contexts/identite-visuelle-context";

type LogoInstitutionnelProps = Omit<
  ComponentProps<typeof LogoMedia>,
  "src" | "nom"
>;

/** Logo configuré par la Présidence, avec les initiales UF comme seul repli. */
export function LogoInstitutionnel(props: LogoInstitutionnelProps) {
  const { logoUrl } = useIdentiteVisuelle();

  return (
    <LogoMedia
      key={logoUrl ?? "logo-institutionnel-par-defaut"}
      {...props}
      src={logoUrl}
      nom={NOM_INSTITUTION}
    />
  );
}
