// src/features/projets/components/ProjetFiltres.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

interface ProjetFiltresProps {
  valeurs: {
    recherche: string
    statut: string[]
    bailleur: string[]
    beneficiaire: string[]
  }
  onChangement: (valeurs: {
    recherche: string
    statut: string[]
    bailleur: string[]
    beneficiaire: string[]
  }) => void
}

export function ProjetFiltres({ valeurs: { recherche, statut, bailleur, beneficiaire }, onChangement }: ProjetFiltresProps) {
  const [rechercheLocale, setRechercheLocale] = useState(recherche)
  const [statutLocale, setStatutLocale] = useState<string[]>(statut)
  const [bailleurLocale, setBailleurLocale] = useState<string[]>(bailleur)
  const [beneficiaireLocale, setBeneficiaireLocale] = useState<string[]>(beneficiaire)

  const rechercheDebouncee = useDebounce(rechercheLocale, 300)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Recherche</label>
        <Input
          value={rechercheLocale}
          onChange={(e) => {
            setRechercheLocale(e.target.value)
            onChangement({ recherche: e.target.value, statut: statutLocale, bailleur: bailleurLocale, beneficiaire: beneficiaireLocale })
          }}
          placeholder="Rechercher par nom..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Statut</label>
        <Select
          value={statutLocale.length === 1 ? statutLocale[0] : ""}
          onValueChange={(value: string) => {
            if (value) {
              setStatutLocale([value])
            } else {
              setStatutLocale([])
            }
            onChangement({ recherche: rechercheDebouncee, statut: statutLocale, bailleur: bailleurLocale, beneficiaire: beneficiaireLocale })
          }}
          aria-label="Sélectionner un statut"
        >
          <SelectTrigger>
            <SelectValue placeholder="Tout statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="BROUILLON">Brouillon</SelectItem>
            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
            <SelectItem value="EN_COURS">En cours</SelectItem>
            <SelectItem value="SUSPENDU">Suspendu</SelectItem>
            <SelectItem value="TERMINE">Terminé</SelectItem>
            <SelectItem value="EXPIRE">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bailleur</label>
        <Input
          value={bailleurLocale.join(",") || ""}
          onChange={(e) => {
            const values = e.target.value.split(",").map((v: string) => v.trim()).filter((v: string) => v !== "")
            setBailleurLocale(values)
            onChangement({ recherche: rechercheDebouncee, statut: statutLocale, bailleur: bailleurLocale, beneficiaire: beneficiaireLocale })
          }}
          placeholder="Bailleur..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bénéficiaire</label>
        <Input
          value={beneficiaireLocale.join(",") || ""}
          onChange={(e) => {
            const values = e.target.value.split(",").map((v: string) => v.trim()).filter((v: string) => v !== "")
            setBeneficiaireLocale(values)
            onChangement({ recherche: rechercheDebouncee, statut: statutLocale, bailleur: bailleurLocale, beneficiaire: beneficiaireLocale })
          }}
          placeholder="Bénéficiaire..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={() => {
          setRechercheLocale("")
          setStatutLocale([])
          setBailleurLocale([])
          setBeneficiaireLocale([])
          onChangement({ recherche: "", statut: [], bailleur: [], beneficiaire: [] })
        }}>
          Réinitialiser
        </Button>
        <Button type="button" variant="outline">
          Appliquer
        </Button>
      </div>
    </div>
  )
}