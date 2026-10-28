import { LoaderCircle } from "lucide-react";

interface ProprietesLoader {
  label?: string;
  pleinePage?: boolean;
  taille?: "sm" | "md" | "lg";
}

const TAILLES = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

/** Indicateur de chargement réutilisable avec libellé accessible. */
export function Loader({
  label = "Chargement en cours",
  pleinePage = false,
  taille = "md",
}: ProprietesLoader) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        pleinePage
          ? "flex min-h-[40vh] items-center justify-center"
          : "inline-flex items-center justify-center"
      }
    >
      <LoaderCircle
        className={`${TAILLES[taille]} motion-safe:animate-spin text-primary`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
