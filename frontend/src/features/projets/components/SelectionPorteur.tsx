import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Etablissement, PageServeur, Porteur, TypePorteur } from "@/types/api"

export type PorteurFormValue =
  | { mode: "existant"; porteur_id: string }
  | { mode: "nouveau"; type_porteur: "PERSONNE"; nom: string; institution_rattachement?: string }
  | { mode: "nouveau"; type_porteur: "ETABLISSEMENT"; etablissement_id: string }
  | { mode: "nouveau"; type_porteur: "AUTRE"; nom: string }

interface SelectionPorteurProps {
  valeur: PorteurFormValue | null
  onChange: (valeur: PorteurFormValue | null) => void
}

const TYPE_DEFAUT: TypePorteur = "PERSONNE"

export function SelectionPorteur({ valeur, onChange }: SelectionPorteurProps) {
  const modeExistant = valeur?.mode === "existant"

  const { data: porteursPage, isLoading: chargementPorteurs } = useQuery({
    queryKey: ["referentiels", "porteurs"],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Porteur>>("/referentiels/porteurs", {
        params: { limit: 100 },
      })
      return reponse.data
    },
  })

  const { data: etablissementsPage, isLoading: chargementEtablissements } = useQuery({
    queryKey: ["etablissements", "liste-complete"],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<Etablissement>>("/etablissements", {
        params: { limit: 100 },
      })
      return reponse.data
    },
  })

  const porteurs = porteursPage?.data ?? []
  const etablissements = etablissementsPage?.data ?? []

  const libellePorteur = (p: Porteur): string => {
    if (p.type_porteur === "ETABLISSEMENT") {
      return p.etablissement_nom ?? "Etablissement sans nom"
    }
    return p.nom ?? "Porteur sans nom"
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              mode: "nouveau",
              type_porteur: "PERSONNE",
              nom: "",
              institution_rattachement: "",
            })
          }
          className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
            !modeExistant
              ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)]"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
          }`}
        >
          Nouveau porteur
        </button>
        <button
          type="button"
          onClick={() => {
            const premier = porteurs[0]
            if (premier) onChange({ mode: "existant", porteur_id: premier.id })
            else onChange({ mode: "existant", porteur_id: "" })
          }}
          className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
            modeExistant
              ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)]"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
          }`}
        >
          Porteur existant
        </button>
      </div>

      {modeExistant ? (
        <Select
          value={valeur && valeur.mode === "existant" ? valeur.porteur_id : ""}
          onValueChange={(id) => onChange({ mode: "existant", porteur_id: id })}
          disabled={chargementPorteurs}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un porteur existant" />
          </SelectTrigger>
          <SelectContent>
            {porteurs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {libellePorteur(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <FormulaireNouveauPorteur
          valeur={valeur}
          onChange={onChange}
          etablissements={etablissements}
          chargementEtablissements={chargementEtablissements}
        />
      )}
    </div>
  )
}

interface FormulaireNouveauPorteurProps {
  valeur: PorteurFormValue | null
  onChange: (valeur: PorteurFormValue | null) => void
  etablissements: Etablissement[]
  chargementEtablissements: boolean
}

function FormulaireNouveauPorteur({
  valeur,
  onChange,
  etablissements,
  chargementEtablissements,
}: FormulaireNouveauPorteurProps) {
  const typeCourant: TypePorteur =
    valeur?.mode === "nouveau" ? valeur.type_porteur : TYPE_DEFAUT

  const basculerType = (nouveau: TypePorteur) => {
    if (nouveau === "PERSONNE") {
      onChange({ mode: "nouveau", type_porteur: "PERSONNE", nom: "", institution_rattachement: "" })
    } else if (nouveau === "ETABLISSEMENT") {
      onChange({ mode: "nouveau", type_porteur: "ETABLISSEMENT", etablissement_id: "" })
    } else {
      onChange({ mode: "nouveau", type_porteur: "AUTRE", nom: "" })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        <RadioType
          label="Personne"
          checked={typeCourant === "PERSONNE"}
          onChange={() => basculerType("PERSONNE")}
        />
        <RadioType
          label="Établissement"
          checked={typeCourant === "ETABLISSEMENT"}
          onChange={() => basculerType("ETABLISSEMENT")}
        />
        <RadioType
          label="Autre"
          checked={typeCourant === "AUTRE"}
          onChange={() => basculerType("AUTRE")}
        />
      </div>

      {typeCourant === "PERSONNE" && valeur?.mode === "nouveau" && valeur.type_porteur === "PERSONNE" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="porteur-nom">Nom complet</Label>
            <Input
              id="porteur-nom"
              value={valeur.nom}
              onChange={(e) =>
                onChange({ mode: "nouveau", type_porteur: "PERSONNE", nom: e.target.value, institution_rattachement: valeur.institution_rattachement })
              }
              placeholder="Ex : Rakoto"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="porteur-institution">Institution de rattachement (facultatif)</Label>
            <Input
              id="porteur-institution"
              value={valeur.institution_rattachement ?? ""}
              onChange={(e) =>
                onChange({ mode: "nouveau", type_porteur: "PERSONNE", nom: valeur.nom, institution_rattachement: e.target.value })
              }
              placeholder="Ex : Université de Toliara"
            />
          </div>
        </>
      ) : null}

      {typeCourant === "ETABLISSEMENT" && valeur?.mode === "nouveau" && valeur.type_porteur === "ETABLISSEMENT" ? (
        <div className="flex flex-col gap-1.5">
          <Label>Établissement</Label>
          <Select
            value={valeur.etablissement_id}
            onValueChange={(id) =>
              onChange({ mode: "nouveau", type_porteur: "ETABLISSEMENT", etablissement_id: id })
            }
            disabled={chargementEtablissements}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un établissement" />
            </SelectTrigger>
            <SelectContent>
              {etablissements.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.sigle ? `${e.sigle} — ${e.nom}` : e.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {typeCourant === "AUTRE" && valeur?.mode === "nouveau" && valeur.type_porteur === "AUTRE" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="porteur-autre-nom">Nom du porteur externe</Label>
          <Input
            id="porteur-autre-nom"
            value={valeur.nom}
            onChange={(e) =>
              onChange({ mode: "nouveau", type_porteur: "AUTRE", nom: e.target.value })
            }
            placeholder="Ex : Ministère de l'Éducation Nationale"
          />
        </div>
      ) : null}
    </div>
  )
}

function RadioType({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-brand)]"
      />
      {label}
    </label>
  )
}