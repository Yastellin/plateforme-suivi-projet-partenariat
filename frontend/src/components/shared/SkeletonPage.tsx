import { Skeleton } from "@/components/ui/skeleton";

interface ProprietesSkeletonPage {
  cartes?: number;
  avecHero?: boolean;
  label?: string;
}

/** Gabarit de chargement de page à réutiliser pendant les requêtes. */
export function SkeletonPage({
  cartes = 3,
  avecHero = false,
  label = "Chargement de la page",
}: ProprietesSkeletonPage) {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={label}
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <span className="sr-only" role="status">
        {label}
      </span>
      {avecHero ? (
        <Skeleton
          className="h-56 w-full rounded-md sm:h-72"
          aria-hidden="true"
        />
      ) : null}
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3 max-w-md" aria-hidden="true" />
        <Skeleton className="h-4 w-full max-w-2xl" aria-hidden="true" />
        <Skeleton className="h-4 w-4/5 max-w-xl" aria-hidden="true" />
      </div>
      {cartes > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cartes }, (_, index) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <Skeleton className="h-40 w-full rounded-md" aria-hidden="true" />
              <Skeleton className="h-5 w-3/4" aria-hidden="true" />
              <Skeleton className="h-4 w-full" aria-hidden="true" />
              <Skeleton className="h-4 w-5/6" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
