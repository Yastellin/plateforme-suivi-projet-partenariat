// src/features/archives/components/ArchivesFiltres.tsx

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
  onChangementType: (type: TypeArchive) => void
}

export function ArchivesFiltres({ type, onChangementType }: ArchivesFiltresProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="sr-only">Type d'archive</Label>
      <Select value={type} onValueChange={(v) => onChangementType(v as TypeArchive)}>
        <SelectTrigger className="h-8 w-48 text-[12.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
