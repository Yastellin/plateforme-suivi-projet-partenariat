// src/features/espace-public/components/SectionEtablissements.tsx
import { Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { EnTeteSection } from "@/features/espace-public/components/EnTeteSection"

// Section etablissements mis en avant sur la page d'accueil publique.
// Affiche les etablissements a la une renvoyes par /public/accueil.
// Apparition echelonnee au scroll (framer-motion) et cartes en survol.
export function SectionEtablissements() {
  const { data, isLoading } = usePublicAccueil()
  const etablissements = data?.etablissements_a_la_une ?? []

  if (!isLoading && etablissements.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <EnTeteSection
        etiquette="Réseau"
        titre="Nos établissements"
        description="Les facultés, écoles et instituts qui composent l'Université de Fianarantsoa."
        lien={{ to: "/etablissements", libelle: "Voir tous" }}
      />

      <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-3 p-5">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          : etablissements.map((etab) => (
              <RevealItem key={etab.id}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-background text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105">
                      {etab.logo_url ? (
                        <img
                          src={etab.logo_url}
                          alt={etab.nom}
                          className="h-8 w-8 rounded object-contain"
                        />
                      ) : (
                        <Building2 size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold text-foreground">
                        {etab.nom}
                      </p>
                      {etab.sigle && (
                        <p className="text-xs text-muted-foreground">{etab.sigle}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </RevealItem>
            ))}
      </RevealGroup>
    </section>
  )
}
