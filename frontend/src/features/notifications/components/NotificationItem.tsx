// src/features/notifications/components/NotificationItem.tsx
import { useState } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useMarquerLue } from "@/features/notifications/api/useMarquerLue"
import {
  useTraiterDemandeModificationProjet,
  type DecisionDemandeModification,
} from "@/features/projets/api/useDemandeModificationProjet"
import { REFERENCE_DEMANDE_MODIFICATION_PROJET } from "@/features/projets/lib/demande-modification-projet"
import type { Notification, PrioriteNotification } from "@/types/api"

const COULEUR_PRIORITE: Record<PrioriteNotification, string> = {
  BASSE: "border-l-muted-foreground",
  MOYENNE: "border-l-amber-500",
  HAUTE: "border-l-destructive",
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const { utilisateur } = useAuth()
  const marquerLue = useMarquerLue()
  const traiter = useTraiterDemandeModificationProjet()
  const [decision, setDecision] =
    useState<DecisionDemandeModification | null>(null)

  const estDemandeModification =
    utilisateur?.role === "PRESIDENCE" &&
    notification.reference_type === REFERENCE_DEMANDE_MODIFICATION_PROJET

  function confirmerDecision() {
    if (!decision) return

    traiter.mutate(
      { projetId: notification.reference_id, decision },
      {
        onSuccess: () => {
          toast.success(
            decision === "approuver"
              ? "Demande approuvée : le projet est de nouveau modifiable"
              : "Demande de modification rejetée",
          )
          setDecision(null)
        },
        onError: (erreur: Error) => toast.error(erreur.message),
      },
    )
  }

  return (
    <article
      className={cn(
        "border-l-4 transition-colors",
        COULEUR_PRIORITE[notification.priorite],
        notification.est_lue ? "bg-transparent" : "bg-accent",
      )}
    >
      <button
        type="button"
        onClick={() =>
          !notification.est_lue && marquerLue.mutate(notification.id)
        }
        className="block w-full p-3 text-left"
      >
        <p className={cn("text-sm", !notification.est_lue && "font-medium")}>
          {notification.titre}
        </p>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {new Date(notification.date_creation).toLocaleString("fr-FR")}
        </p>
      </button>

      {estDemandeModification ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border)] px-3 py-2">
          <button
            type="button"
            onClick={() => setDecision("rejeter")}
            disabled={traiter.isPending}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--status-expire-fg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--status-expire-fg)] hover:bg-[var(--status-expire-bg)] disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Rejeter
          </button>
          <button
            type="button"
            onClick={() => setDecision("approuver")}
            disabled={traiter.isPending}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            Approuver
          </button>
        </div>
      ) : null}

      {decision ? (
        <ConfirmDialog
          ouvert
          onFermer={() => setDecision(null)}
          onConfirmer={confirmerDecision}
          titre={
            decision === "approuver"
              ? "Approuver cette demande ?"
              : "Rejeter cette demande ?"
          }
          description={
            decision === "approuver"
              ? "Le projet repassera en brouillon et sera retiré de la publication. L'établissement pourra le modifier puis le soumettre à nouveau."
              : "Le projet restera verrouillé dans son état actuel. L'établissement sera informé du rejet."
          }
          libelleAction={decision === "approuver" ? "Approuver" : "Rejeter"}
          enCours={traiter.isPending}
          destructif={decision === "rejeter"}
        />
      ) : null}
    </article>
  )
}
