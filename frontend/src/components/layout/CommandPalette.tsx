// src/components/layout/CommandPalette.tsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import apiClient from "@/lib/api-client"
import type { RoleUtilisateur } from "@/types/api"

interface ResultatRecherche {
  id: string
  type: string
  titre: string
}

interface CommandPaletteProps {
  ouvert: boolean
  onFermer: () => void
}

function cheminDetail(role: RoleUtilisateur, type: string, id: string): string {
  const prefixe = role === "PRESIDENCE" ? "presidence" : role === "ETABLISSEMENT" ? "etablissement" : "decideur"
  const typeRoute = type.toLowerCase() + "s"
  return `/${prefixe}/${typeRoute}/${id}`
}

export function CommandPalette({ ouvert, onFermer }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [recherche, setRecherche] = useState("")
  const rechercheDebouncee = useDebounce(recherche, 200)

  const { data: resultats } = useQuery({
    queryKey: ["recherche", rechercheDebouncee],
    queryFn: async () => {
      const reponse = await apiClient.get<ResultatRecherche[]>("/recherche", {
        params: { q: rechercheDebouncee, type: "TOUT" },
      })
      return reponse.data
    },
    enabled: ouvert && rechercheDebouncee.length >= 2,
  })

  useEffect(() => {
    function gererTouche(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (ouvert) onFermer()
      }
      if (e.key === "Escape" && ouvert) {
        onFermer()
      }
    }
    document.addEventListener("keydown", gererTouche)
    return () => document.removeEventListener("keydown", gererTouche)
  }, [ouvert, onFermer])

  if (!ouvert) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={onFermer} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-surface shadow-md">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un partenaire, projet, convention..."
            className="border-0 bg-transparent text-[14px] shadow-none focus-visible:ring-0"
            autoFocus
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-data text-muted-foreground">Esc</kbd>
        </div>

        {resultats && resultats.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {resultats.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => {
                  navigate(cheminDetail(utilisateur?.role ?? "PRESIDENCE", r.type, r.id))
                  onFermer()
                  setRecherche("")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <Badge variant="outline" className="shrink-0 text-[10px]">{r.type}</Badge>
                <span className="text-sm text-foreground">{r.titre}</span>
              </button>
            ))}
          </div>
        )}

        {rechercheDebouncee.length >= 2 && resultats && resultats.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">Aucun résultat</div>
        )}
      </div>
    </div>
  )
}
