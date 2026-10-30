// src/features/messages-contact/pages/MessagesContactPage.tsx
import { useState } from "react"
import { toast } from "sonner"
import { Dialog as DialogPrimitive } from "radix-ui"
import {
  Building2,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { TablePagination } from "@/components/shared/TablePagination"
import { cn } from "@/lib/utils"
import {
  useMarquerMessageLu,
  useMessagesContact,
  useNombreMessagesNonLus,
  useSupprimerMessageContact,
  type FiltreLecture,
} from "@/features/messages-contact/api/useMessagesContact"
import type { MessageContact } from "@/types/api"

const formaterDateCourte = (valeur: string) =>
  new Date(valeur).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })

// Initiales de l'expéditeur (ex. « Jean Rakoto » -> « JR »)
const initiales = (nom: string) => {
  const morceaux = nom.trim().split(/\s+/).filter(Boolean)
  if (morceaux.length >= 2) return `${morceaux[0][0]}${morceaux[1][0]}`.toUpperCase()
  return (morceaux[0] ?? "?").slice(0, 2).toUpperCase()
}

const OPTIONS_FILTRE: { valeur: FiltreLecture; libelle: string }[] = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "non-lus", libelle: "Non lus" },
  { valeur: "lus", libelle: "Lus" },
]

// Boîte de réception des messages du formulaire de contact public.
// La liste occupe toute la largeur ; un clic ouvre le message dans un volet
// latéral (comme une boîte e-mail). La Présidence voit tout, un établissement
// seulement ses messages (filtre appliqué par l'API).
export function MessagesContactPage() {
  const [filtre, setFiltre] = useState<FiltreLecture>("non-lus")
  const [page, setPage] = useState(1)
  const [ouvert, setOuvert] = useState<MessageContact | null>(null)
  const [aSupprimer, setASupprimer] = useState<MessageContact | null>(null)

  const { data, isLoading } = useMessagesContact(filtre, page)
  const { data: nonLus } = useNombreMessagesNonLus()
  const marquerLu = useMarquerMessageLu()
  const supprimer = useSupprimerMessageContact()

  const messages = data?.data ?? []

  function changerFiltre(valeur: FiltreLecture) {
    setFiltre(valeur)
    setPage(1)
  }

  function ouvrirMessage(message: MessageContact) {
    setOuvert(message)
    if (!message.est_lu) marquerLu.mutate(message.id)
  }

  function confirmerSuppression() {
    if (!aSupprimer) return
    const id = aSupprimer.id
    supprimer.mutate(id, {
      onSuccess: () => {
        toast.success("Message supprimé")
        if (ouvert?.id === id) setOuvert(null)
        setASupprimer(null)
      },
      onError: (erreur: Error) => toast.error(erreur.message),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titre="Messages de contact"
        description="Messages envoyés depuis le formulaire public de la vitrine."
      />

      <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Messages</h2>
            {typeof nonLus === "number" && nonLus > 0 ? (
              <span className="rounded-full bg-[var(--color-brand)] px-2.5 py-0.5 text-[12px] font-semibold text-white">
                {nonLus} non lu{nonLus > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="Filtrer les messages"
            className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] p-0.5"
          >
            {OPTIONS_FILTRE.map((option) => (
              <button
                key={option.valeur}
                type="button"
                aria-pressed={filtre === option.valeur}
                onClick={() => changerFiltre(option.valeur)}
                className={cn(
                  "rounded-[calc(var(--radius-sm)-2px)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  filtre === option.valeur
                    ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {option.libelle}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0, 1, 2, 3].map((cle) => (
              <Skeleton key={cle} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center">
            <span className="grid h-28 w-28 place-items-center rounded-full bg-[var(--color-page-bg)]">
              <Mail className="h-14 w-14 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">Aucun message</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {filtre === "non-lus"
                  ? "Aucun message non lu."
                  : filtre === "lus"
                    ? "Aucun message lu pour le moment."
                    : "Aucun message reçu pour le moment."}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {messages.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => ouvrirMessage(message)}
                  className={cn(
                    "grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-page-bg)]",
                    !message.est_lu && "bg-[var(--color-active-zone)] hover:bg-[var(--color-active-zone)]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-lg",
                      message.est_lu
                        ? "bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]"
                        : "bg-[var(--color-brand)] text-white",
                    )}
                  >
                    {message.est_lu ? <MailOpen className="h-[18px] w-[18px]" /> : <Mail className="h-[18px] w-[18px]" />}
                  </span>

                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-[14.5px] text-[var(--color-text-primary)]",
                          message.est_lu ? "font-medium" : "font-semibold",
                        )}
                      >
                        {message.sujet}
                      </span>
                      {!message.est_lu ? (
                        <span aria-label="Non lu" className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-brand)]" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">{message.nom}</span>
                      {" · "}
                      {message.email}
                      {message.destinataire ? ` · ${message.destinataire.sigle ?? message.destinataire.nom}` : ""}
                    </span>
                    <span className="mt-1 line-clamp-1 block text-[13px] text-[var(--color-text-secondary)]">
                      {message.message}
                    </span>
                  </span>

                  <span className="flex flex-col items-end gap-1 whitespace-nowrap">
                    <time dateTime={message.date_creation} className="text-[12px] text-[var(--color-text-secondary)]">
                      {formaterDateCourte(message.date_creation)}
                    </time>
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">{message.reference}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {data && data.meta.totalPages > 1 ? (
          <TablePagination meta={data.meta} onChangerPage={setPage} />
        ) : null}
      </section>

      <VoletMessage
        message={ouvert}
        onFermer={() => setOuvert(null)}
        onSupprimer={(message) => setASupprimer(message)}
      />

      {aSupprimer ? (
        <ConfirmDialog
          ouvert
          onFermer={() => setASupprimer(null)}
          onConfirmer={confirmerSuppression}
          titre="Supprimer ce message ?"
          description={`Le message de ${aSupprimer.nom} (${aSupprimer.reference}) sera supprimé définitivement, ainsi que ses notifications.`}
          libelleAction="Supprimer"
          enCours={supprimer.isPending}
          destructif
        />
      ) : null}
    </div>
  )
}

// Volet latéral de lecture (glisse depuis la droite), façon boîte e-mail.
function VoletMessage({
  message,
  onFermer,
  onSupprimer,
}: {
  message: MessageContact | null
  onFermer: () => void
  onSupprimer: (message: MessageContact) => void
}) {
  return (
    <DialogPrimitive.Root open={message !== null} onOpenChange={(valeur) => !valeur && onFermer()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none"
        >
          {message ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.sujet}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
                  >
                    <Reply className="h-3.5 w-3.5" /> Répondre
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[var(--status-expire-fg)] hover:bg-[var(--color-page-bg)]"
                    onClick={() => onSupprimer(message)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </Button>
                </div>
                <DialogPrimitive.Close
                  aria-label="Fermer"
                  className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <DialogPrimitive.Title className="break-words text-[20px] font-semibold leading-7 text-[var(--color-text-primary)]">
                  {message.sujet}
                </DialogPrimitive.Title>

                <div className="mt-5 flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-[var(--color-active-zone)] text-[14px] font-bold text-[var(--color-brand)]"
                  >
                    {initiales(message.nom)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[var(--color-text-primary)]">{message.nom}</p>
                    <a href={`mailto:${message.email}`} className="block truncate text-[13px] text-[var(--color-brand)] hover:underline">
                      {message.email}
                    </a>
                  </div>
                  <time dateTime={message.date_creation} className="ml-auto whitespace-nowrap text-[12.5px] text-[var(--color-text-secondary)]">
                    {formaterDateCourte(message.date_creation)}
                  </time>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 text-[13.5px]">
                  <div className="rounded-lg border border-[var(--color-border)] p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Destinataire</dt>
                    <dd className="mt-1 flex items-center gap-1.5 break-words font-medium text-[var(--color-text-primary)]">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-brand)]" />
                      {message.destinataire
                        ? `${message.destinataire.nom}${message.destinataire.sigle ? ` (${message.destinataire.sigle})` : ""}`
                        : "Présidence de l'Université"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-[var(--color-border)] p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Téléphone</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-[var(--color-text-primary)]">
                      {message.telephone ? (
                        <>
                          <Phone className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                          <a href={`tel:${message.telephone}`} className="font-medium text-[var(--color-brand)] hover:underline">
                            {message.telephone}
                          </a>
                        </>
                      ) : (
                        <span className="text-[var(--color-text-secondary)]">Non renseigné</span>
                      )}
                    </dd>
                  </div>
                  <div className="col-span-2 rounded-lg border border-[var(--color-border)] p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Référence</dt>
                    <dd className="mt-1 font-mono text-[13px] text-[var(--color-text-primary)]">{message.reference}</dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Message</p>
                  <div className="whitespace-pre-wrap break-words rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] p-5 text-[14.5px] leading-7 text-[var(--color-text-primary)] [overflow-wrap:anywhere]">
                    {message.message}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
