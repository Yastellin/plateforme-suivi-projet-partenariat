// src/features/espace-public/components/SectionEtablissements.tsx
import { Link } from "react-router-dom"
import { Building2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"

// Section etablissements mis en avant sur la page d'accueil publique.
// Affiche les etablissements a la une renvoyes par /public/accueil.
// Fade-in au scroll via IntersectionObserver (section 8 : fade-in au scroll).
export function SectionEtablissements() {
  const { data, isLoading } = usePublicAccueil()
  const etablissements = data?.etablissements_a_la_une ?? []

  if (!isLoading && etablissements.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Nos établissements
        </h2>
        <Link
          to="/etablissements"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Voir tous
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          : etablissements.map((etab) => (
              <Card key={etab.id} className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    {etab.logo_url ? (
                      <img
                        src={etab.logo_url}
                        alt={etab.nom}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-medium text-foreground">
                      {etab.nom}
                    </p>
                    {etab.sigle && (
                      <p className="text-xs text-muted-foreground">{etab.sigle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  )
}
