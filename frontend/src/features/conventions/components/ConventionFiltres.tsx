// src/features/conventions/components/ConventionFiltres.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

interface ConventionFiltresProps {
  valeurs: {
    recherche: string
    statut: string[]
    etablissement: string[]
  }
  onChangement: (valeurs: {
    recherche: string
    statut: string[]
    etablissement: string[]
  }) => void
}

export function ConventionFiltres({ valeurs: { recherche, statut, etablissement }, onChangement }: ConventionFiltresProps) {
  const [rechercheLocale, setRechercheLocale] = useState(recherche)
  const [statutLocale, setStatutLocale] = useState<string[]>(statut)
  const [etablissementLocale, setEtablissementLocale] = useState<string[]>(etablissement)

  const rechercheDebouncee = useDebounce(rechercheLocale, 300)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Recherche</label>
        <Input
          value={rechercheLocale}
          onChange={(e) => {
            setRechercheLocale(e.target.value)
            onChangement({ recherche: e.target.value, statut: statutLocale, etablissement: etablissementLocale })
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
            onChangement({ recherche: rechercheDebouncee, statut: statutLocale, etablissement: etablissementLocale })
          }}
          aria-label="Sélectionner un statut"
        >
          <SelectTrigger>
            <SelectValue placeholder="Tout statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="BROUILLON">Brouillon</SelectItem>
            <SelectItem value="EN_ATTENTE_SIGNATURE">En attente signature</SelectItem>
            <SelectItem value="SIGNEE">Signée</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDUE">Suspendue</SelectItem>
            <SelectItem value="EXPIRE">Expirée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Établissement</label>
        <Input
          value={etablissementLocale.join(",") || ""}
          onChange={(e) => {
            const values = e.target.value.split(",").map((v: string) => v.trim()).filter((v: string) => v !== "")
            setEtablissementLocale(values)
            onChangement({ recherche: rechercheDebouncee, statut: statutLocale, etablissement: etablissementLocale })
          }}
          placeholder="Établissement..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={() => {
          setRechercheLocale("")
          setStatutLocale([])
          setEtablissementLocale([])
          onChangement({ recherche: "", statut: [], etablissement: [] })
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