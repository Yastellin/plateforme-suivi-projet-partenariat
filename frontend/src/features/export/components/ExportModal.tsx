// src/features/export/components/ExportModal.tsx
import { useState } from "react"
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useExport } from "@/features/export/api/useExport"

interface ExportModalProps {
  ouvert: boolean
  onFermer: () => void
  ressource: "projets" | "conventions"
  filtres?: Record<string, string | number | undefined>
}

const FORMATS = [
  {
    value: "pdf" as const,
    label: "PDF",
    description: "Document formate, pret a imprimer",
    icon: FileDown,
  },
  {
    value: "xlsx" as const,
    label: "Excel",
    description: "Tableur modifiable pour analyse",
    icon: FileSpreadsheet,
  },
]

// Modal de selection du format d'export (section 7.1). Le backend genere
// le fichier cote serveur ; le frontend declenche simplement le
// telechargement via un blob temporaire.
export function ExportModal({ ouvert, onFermer, ressource, filtres }: ExportModalProps) {
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf")
  const exportMutation = useExport()

  function gererExport() {
    exportMutation.mutate(
      { ressource, format, filtres },
      {
        onSuccess: () => {
          toast.success(`Export ${format.toUpperCase()} lance avec succes.`)
          onFermer()
        },
        onError: (erreur: Error) => {
          toast.error(erreur.message || "Erreur lors de l'export.")
        },
      }
    )
  }

  const titreRessource = ressource === "projets" ? "Projets" : "Conventions"

  return (
    <Dialog open={ouvert} onOpenChange={(ouverte) => { if (!exportMutation.isPending && !ouverte) onFermer() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les {titreRessource.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Choisissez le format du fichier a telecharger.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormat(f.value)}
              disabled={exportMutation.isPending}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors",
                format === f.value
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              )}
            >
              <f.icon size={24} />
              <span className="font-heading text-sm font-medium">{f.label}</span>
              <span className="text-xs">{f.description}</span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFermer} disabled={exportMutation.isPending}>
            Annuler
          </Button>
          <Button onClick={gererExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <FileDown size={16} />
                Telecharger en {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
