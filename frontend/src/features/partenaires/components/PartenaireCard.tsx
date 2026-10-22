// src/features/partenaires/components/PartenaireCard.tsx
import { Building2, Globe, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LogoMedia } from "@/components/shared/ImageMedia"
import { obtenirInfoStatut } from "@/lib/status-mappings"
import type { Partenaire } from "@/types/api"

interface PartenaireCardProps {
  partenaire: Partenaire
  onClic?: () => void
}

// Carte de partenaire utilisee dans les grilles de resultats :
// logo initialed si aucun logo n'a encore ete televerse.
export function PartenaireCard({ partenaire, onClic }: PartenaireCardProps) {
  return (
    <button type="button" onClick={onClic} className="w-full text-left">
      <Card size="sm" className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-3">
          <LogoMedia
            src={partenaire.logo_url}
            nom={partenaire.nom}
            className="size-12 shrink-0 rounded-lg border border-border object-contain p-1 text-sm"
            loading="lazy"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <span className="truncate font-heading text-sm font-semibold">{partenaire.nom}</span>
              <StatusBadge libelle={obtenirInfoStatut(partenaire.statut).libelle} tonalite={obtenirInfoStatut(partenaire.statut).tonalite} />
            </div>
            <span className="text-xs text-muted-foreground">
              {partenaire.type} - {partenaire.pays}
            </span>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {partenaire.site_web && (
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  Site web
                </span>
              )}
              {partenaire.est_strategique && (
                <span className="flex items-center gap-1 text-accent-foreground">
                  <Star size={12} className="fill-current" />
                  Strategique
                </span>
              )}
              {partenaire.contacts && partenaire.contacts.length > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {partenaire.contacts.length} contact{partenaire.contacts.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
