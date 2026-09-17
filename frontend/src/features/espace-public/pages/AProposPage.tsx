// src/features/espace-public/pages/AProposPage.tsx
import { Building2, Target, Eye, Users, Handshake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Page "A propos" de la vitrine publique (section 6.2 : navigation
// Accueil, A propos, Etablissements...). Presente la mission et la vision
// de la plateforme de suivi des partenariats.
export function AProposPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* En-tete */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Building2 size={32} />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">
          À propos de la plateforme
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          La plateforme centralisée de suivi des projets et partenariats de
          l'Université de Fianarantsoa, conçue pour garantir la transparence
          et l'efficacité de la coopération universitaire.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Target size={20} />
            </div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Notre mission
            </h2>
            <p className="text-sm text-muted-foreground">
              Centraliser et optimiser la gestion des partenariats, projets,
              conventions et cotutelles de thèse au sein de l'Université de
              Fianarantsoa, en offrant un outil unique et transparent à
              toutes les parties prenantes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Eye size={20} />
            </div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Notre vision
            </h2>
            <p className="text-sm text-muted-foreground">
              Devenir la référence en matière de suivi numérique des
              partenariats universitaires à Madagascar, en favorisant la
              collaboration inter-établissement et la diffusion des résultats
              de recherche.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Valeurs */}
      <div className="mt-12">
        <h2 className="text-center font-heading text-xl font-semibold text-foreground">
          Nos valeurs
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Handshake,
              titre: "Collaboration",
              description:
                "Nous croyons en la force du travail conjoint entre établissements, partenaires et décideurs.",
            },
            {
              icon: Users,
              titre: "Transparence",
              description:
                "Chaque étape du suivi est visible et traçable, de la soumission à la publication des résultats.",
            },
            {
              icon: Target,
              titre: "Excellence",
              description:
                "Nous visons des standards élevés dans la gestion des projets et la qualité des conventions.",
            },
          ].map((valeur) => (
            <Card key={valeur.titre}>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <valeur.icon size={20} />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {valeur.titre}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {valeur.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chiffres cles */}
      <div className="mt-12 rounded-xl bg-accent/30 p-8 text-center">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          L'Université de Fianarantsoa en chiffres
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Une institution historique au cœur de la coopération universitaire internationale.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { valeur: "1961", label: "Année de création" },
            { valeur: "13", label: "Facultés" },
            { valeur: "30 000+", label: "Étudiants" },
            { valeur: "50+", label: "Partenaires internationaux" },
          ].map((chiffre) => (
            <div key={chiffre.label}>
              <p className="font-heading text-2xl font-bold text-primary">
                {chiffre.valeur}
              </p>
              <p className="text-xs text-muted-foreground">{chiffre.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
