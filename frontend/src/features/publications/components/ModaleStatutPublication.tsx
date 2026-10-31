// src/features/publications/components/ModaleStatutPublication.tsx

import { useEffect, useId, useRef } from "react"
import { EyeOff, Globe, Loader2 } from "lucide-react"

export type ActionStatutPublication = "RETIRER" | "PUBLIER"

interface ModaleStatutPublicationProps {
  action: ActionStatutPublication
  titrePublication: string
  enCours: boolean
  erreur: string | null
  onConfirmer: () => void
  onAnnuler: () => void
}

const CONFIGURATION = {
  RETIRER: {
    icone: EyeOff,
    pastille: "bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-400",
    titre: "Retirer de l'espace public ?",
    texte:
      "La publication ne sera plus visible par le public. Elle reste enregistrée en brouillon et pourra être republiée à tout moment.",
    libelleBouton: "Retirer",
    classeBouton:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
  },
  PUBLIER: {
    icone: Globe,
    pastille:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    titre: "Publier sur l'espace public ?",
    texte: "La publication deviendra visible par tous les visiteurs de l'espace public.",
    libelleBouton: "Publier",
    classeBouton:
      "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400",
  },
} as const

export function ModaleStatutPublication({
  action,
  titrePublication,
  enCours,
  erreur,
  onConfirmer,
  onAnnuler,
}: ModaleStatutPublicationProps) {
  const idTitre = useId()
  const idTexte = useId()
  const boutonAnnulerRef = useRef<HTMLButtonElement>(null)
  const config = CONFIGURATION[action]
  const Icone = config.icone

  useEffect(() => {
    boutonAnnulerRef.current?.focus()
  }, [])

  useEffect(() => {
    function fermerAvecEchap(evenement: KeyboardEvent) {
      if (evenement.key === "Escape" && !enCours) onAnnuler()
    }
    window.addEventListener("keydown", fermerAvecEchap)
    return () => window.removeEventListener("keydown", fermerAvecEchap)
  }, [enCours, onAnnuler])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(evenement) => {
        if (evenement.target === evenement.currentTarget && !enCours) onAnnuler()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        aria-describedby={idTexte}
        className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e1714]"
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${config.pastille}`}>
          <Icone className="h-5 w-5" aria-hidden="true" />
        </div>

        <h2 id={idTitre} className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          {config.titre}
        </h2>
        <p id={idTexte} className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {config.texte}
        </p>
        <p className="mt-3 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          « {titrePublication} »
        </p>

        {erreur ? (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"
          >
            {erreur}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={boutonAnnulerRef}
            type="button"
            onClick={onAnnuler}
            disabled={enCours}
            className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-black/5 disabled:opacity-60 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirmer}
            disabled={enCours}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-60 ${config.classeBouton}`}
          >
            {enCours ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {config.libelleBouton}
          </button>
        </div>
      </div>
    </div>
  )
}
