// src/features/notifications/components/NotificationItem.tsx
import { useState } from "react"
import { Check, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useMarquerLue } from "@/features/notifications/api/useMarquerLue"
import { useSupprimerMessageContact } from "@/features/messages-contact/api/useMessagesContact"
import {
  useTraiterDemandeModificationProjet,
  type DecisionDemandeModification,
} from "@/features/projets/api/useDemandeModificationProjet"
import { REFERENCE_DEMANDE_MODIFICATION_PROJET } from "@/features/projets/lib/demande-modification-projet"
import type { Notification, PrioriteNotification } from "@/types/api"
import {
  analyserMessageContact,
  TYPE_REFERENCE_MESSAGE_CONTACT,
} from "@/features/notifications/lib/message-contact"

const formaterDateNotification = (valeur: string) =>
  new Date(valeur).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })

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
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)
  const supprimerMessage = useSupprimerMessageContact()

  // Notification de message de contact : on affiche les champs et le corps séparément
  const contenu =
    notification.reference_type === TYPE_REFERENCE_MESSAGE_CONTACT
      ? analyserMessageContact(notification.message)
      : null

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

  const estMessageContact = notification.reference_type === TYPE_REFERENCE_MESSAGE_CONTACT

  function supprimerLeMessage() {
    supprimerMessage.mutate(notification.reference_id, {
      onSuccess: () => {
        toast.success("Message supprimé")
        setConfirmerSuppression(false)
      },
      onError: (erreur: Error) => toast.error(erreur.message),
    })
  }

  return (
    <article
      className={cn(
        "min-w-0 border-l-4 transition-colors",
        COULEUR_PRIORITE[notification.priorite],
        notification.est_lue ? "bg-transparent" : "bg-accent",
      )}
    >
      <button
        type="button"
        onClick={() =>
          !notification.est_lue && marquerLue.mutate(notification.id)
        }
        className="block w-full min-w-0 px-4 py-3.5 text-left"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p
            className={cn(
              "min-w-0 break-words text-[14px] leading-5 text-foreground",
              !notification.est_lue ? "font-semibold" : "font-medium",
            )}
          >
            {notification.titre}
          </p>
          {!notification.est_lue ? (
            <span aria-label="Non lue" className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>

        {contenu ? (
          <div className="mt-2 flex min-w-0 flex-col gap-2">
            <dl className="flex min-w-0 flex-col gap-1 text-[13px] leading-5">
              {contenu.champs.map((champ) => (
                <div key={champ.libelle} className="flex min-w-0 gap-2">
                  <dt className="w-[78px] flex-shrink-0 text-muted-foreground">{champ.libelle}</dt>
                  <dd className="min-w-0 break-words font-medium text-foreground [overflow-wrap:anywhere]">
                    {champ.valeur}
                  </dd>
                </div>
              ))}
            </dl>
            {contenu.corps ? (
              <blockquote className="min-w-0 break-words whitespace-pre-wrap rounded-lg border-l-2 border-primary/60 bg-muted/50 px-3 py-2 text-[13px] leading-6 text-foreground [overflow-wrap:anywhere] line-clamp-6">
                {contenu.corps}
              </blockquote>
            ) : null}
          </div>
        ) : (
          <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-5 text-muted-foreground [overflow-wrap:anywhere] line-clamp-4">
            {notification.message}
          </p>
        )}

        <time
          dateTime={notification.date_creation}
          className="mt-2 block text-xs text-muted-foreground"
        >
          {formaterDateNotification(notification.date_creation)}
        </time>
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

      {estMessageContact ? (
        <div className="flex justify-end border-t border-[var(--color-border)] px-3 py-2">
          <button
            type="button"
            onClick={() => setConfirmerSuppression(true)}
            disabled={supprimerMessage.isPending}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer le message
          </button>
        </div>
      ) : null}

      {confirmerSuppression ? (
        <ConfirmDialog
          ouvert
          onFermer={() => setConfirmerSuppression(false)}
          onConfirmer={supprimerLeMessage}
          titre="Supprimer ce message ?"
          description="Le message et ses notifications seront supprimés définitivement."
          libelleAction="Supprimer"
          enCours={supprimerMessage.isPending}
          destructif
        />
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
