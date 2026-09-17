// src/features/archives/components/ArchivesFiltres.tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TypeArchive } from "@/types/api"

const TYPES: { value: TypeArchive; label: string }[] = [
  { value: "partenaires", label: "Partenaires" },
  { value: "partenariats", label: "Partenariats" },
  { value: "projets", label: "Projets" },
  { value: "conventions", label: "Conventions" },
  { value: "cotutelles", label: "Cotutelles" },
]

interface ArchivesFiltresProps {
  type: TypeArchive
  recherche: string
  onChangementType: (type: TypeArchive) => void
  onChangementRecherche: (recherche: string) => void
}

export function ArchivesFiltres({ type, recherche, onChangementType, onChangementRecherche }: ArchivesFiltresProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label>Type d'archive</Label>
        <Select value={type} onValueChange={(v) => onChangementType(v as TypeArchive)}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Label>Recherche</Label>
        <Input value={recherche} onChange={(e) => onChangementRecherche(e.target.value)} placeholder="Rechercher..." />
      </div>
    </div>
  )
}