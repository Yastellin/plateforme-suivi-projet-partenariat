// src/features/partenariats/components/PartenariatFiltres.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PartenariatFiltresProps {
  valeurs: { recherche: string; statut: string[]; domaine: string[] }
  onChangement: (valeurs: { recherche: string; statut: string[]; domaine: string[] }) => void
}

const STATUTS = ["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "TERMINE"]
const DOMAINES = ["RECHERCHE", "FORMATION", "INNOVATION", "DEVELOPPEMENT", "COOPERATION_INSTITUTIONNELLE", "AUTRE"]

export function PartenariatFiltres({ valeurs, onChangement }: PartenariatFiltresProps) {
  const basculerValeur = (liste: string[], valeur: string) =>
    liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recherche-partenariat">Recherche</Label>
        <Input
          id="recherche-partenariat"
          placeholder="Intitule..."
          value={valeurs.recherche}
          onChange={(e) => onChangement({ ...valeurs, recherche: e.target.value })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Statut</p>
        <div className="flex flex-col gap-2">
          {STATUTS.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox
                id={`statut-${s}`}
                checked={valeurs.statut.includes(s)}
                onCheckedChange={() => onChangement({ ...valeurs, statut: basculerValeur(valeurs.statut, s) })}
              />
              <Label htmlFor={`statut-${s}`} className="font-normal">{s}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Domaine</p>
        <div className="flex flex-col gap-2">
          {DOMAINES.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <Checkbox
                id={`domaine-${d}`}
                checked={valeurs.domaine.includes(d)}
                onCheckedChange={() => onChangement({ ...valeurs, domaine: basculerValeur(valeurs.domaine, d) })}
              />
              <Label htmlFor={`domaine-${d}`} className="font-normal">{d}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}