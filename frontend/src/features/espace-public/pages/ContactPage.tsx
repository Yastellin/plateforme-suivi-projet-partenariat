// src/features/espace-public/pages/ContactPage.tsx
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FormulaireContact } from "@/features/espace-public/components/FormulaireContact"
import { COORDONNEES_PUBLIQUES } from "@/features/espace-public/lib/coordonneesPubliques"

// Page Contact de la vitrine publique (section 7.4 : "Contact" →
// formulaire avec validation temps reel → toast).
export function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Contactez-nous
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Vous avez une question ou souhaitez en savoir plus sur nos projets
          et partenariats ? N'hésitez pas à nous écrire.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Formulaire */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                Envoyez-nous un message
              </h2>
              <FormulaireContact />
            </CardContent>
          </Card>
        </div>

        {/* Coordonnees */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-medium text-foreground">
                  Adresse
                </p>
                <p className="text-sm text-muted-foreground">
                  Bâtiment administratif, Université de Fianarantsoa
                  <br />
                  B.P. 402, Fianarantsoa 301, Madagascar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Mail size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-medium text-foreground">
                  Email
                </p>
                <p className="text-sm text-muted-foreground">
                  {COORDONNEES_PUBLIQUES.courriel}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Phone size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-medium text-foreground">
                  Téléphone
                </p>
                <p className="text-sm text-muted-foreground">
                  {COORDONNEES_PUBLIQUES.telephone}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-heading text-sm font-medium text-foreground">
                  Horaires
                </p>
                <p className="text-sm text-muted-foreground">
                  Lundi — Vendredi : 08h00 — 16h30
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
