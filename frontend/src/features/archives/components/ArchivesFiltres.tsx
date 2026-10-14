// src/features/archives/components/ArchivesFiltres.tsx
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ModeArchives } from "@/types/api"

const MODES: { value: ModeArchives; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "partenaires", label: "Partenaires" },
  { value: "partenariats", label: "Partenariats" },
  { value: "projets", label: "Projets" },
  { value: "conventions", label: "Conventions" },
  { value: "cotutelles", label: "Cotutelles" },
  { value: "documents", label: "Documents" },
]

interface ArchivesFiltresProps {
  mode: ModeArchives
  onChangementMode: (mode: ModeArchives) => void
}

export function ArchivesFiltres({ mode, onChangementMode }: ArchivesFiltresProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="sr-only">Type d'archive</Label>
      <Select value={mode} onValueChange={(v) => onChangementMode(v as ModeArchives)}>
        <SelectTrigger className="h-8 w-48 text-[12.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}