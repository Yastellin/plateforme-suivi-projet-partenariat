// src/features/messages-contact/pages/MessagesContactPage.tsx
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Building2, Mail, MailOpen, Phone, RefreshCw, Reply, Trash2 } from "lucide-react"
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

const formaterDate = (valeur: string) =>
  new Date(valeur).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })

const formaterDateListe = (valeur: string) => {
  const date = new Date(valeur)
  const aujourdhui = new Date()
  return date.toDateString() === aujourdhui.toDateString()
    ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

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

// Boîte de réception façon client e-mail : liste à gauche, lecture à droite.
export function MessagesContactPage() {
  const [filtre, setFiltre] = useState<FiltreLecture>("non-lus")
  const [page, setPage] = useState(1)
  const [selectionId, setSelectionId] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<MessageContact | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, isFetching } = useMessagesContact(filtre, page)
  const { data: nonLus } = useNombreMessagesNonLus()
  const marquerLu = useMarquerMessageLu()
  const supprimer = useSupprimerMessageContact()

  const messages = data?.data ?? []
  const selection: MessageContact | null =
    messages.find((message) => message.id === selectionId) ?? messages[0] ?? null

  // Un message ouvert (ou sélectionné par défaut) passe en lu
  useEffect(() => {
    if (selection && !selection.est_lu) marquerLu.mutate(selection.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.id])

  function changerFiltre(valeur: FiltreLecture) {
    setFiltre(valeur)
    setPage(1)
    setSelectionId(null)
  }

  function confirmerSuppression() {
    if (!aSupprimer) return
    const id = aSupprimer.id
    const index = messages.findIndex((message) => message.id === id)
    supprimer.mutate(id, {
      onSuccess: () => {
        toast.success("Message supprimé")
        // Sélectionne le message suivant (ou le précédent) dans la liste
        const suivant = messages[index + 1] ?? messages[index - 1]
        setSelectionId(suivant && suivant.id !== id ? suivant.id : null)
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

      <section className="grid h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] lg:grid-cols-[360px_1fr]">
        {/* ---------- Liste ---------- */}
        <div className="flex min-h-0 flex-col border-r border-[var(--color-border)]">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Messages</h2>
              {typeof nonLus === "number" && nonLus > 0 ? (
                <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[11px] font-semibold text-white">
                  {nonLus}
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
                    "rounded-[calc(var(--radius-sm)-2px)] px-2.5 py-1 text-[12px] font-semibold transition-colors",
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {[0, 1, 2, 3, 4].map((cle) => (
                  <Skeleton key={cle} className="h-[84px] w-full rounded-lg" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                <span className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-page-bg)]">
                  <Mail className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">Aucun message</p>
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
              <ul>
                {messages.map((message) => {
                  const actif = selection?.id === message.id
                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => setSelectionId(message.id)}
                        aria-current={actif ? "true" : undefined}
                        className={cn(
                          "flex w-full flex-col gap-1 border-b border-[var(--color-border)] px-4 py-3.5 text-left transition-colors",
                          actif
                            ? "bg-[var(--color-active-zone)]"
                            : "hover:bg-[var(--color-page-bg)]",
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            {!message.est_lu ? (
                              <span aria-label="Non lu" className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-brand)]" />
                            ) : null}
                            <span
                              className={cn(
                                "truncate text-[13.5px] text-[var(--color-text-primary)]",
                                message.est_lu ? "font-medium" : "font-semibold",
                              )}
                            >
                              {message.nom}
                            </span>
                          </span>
                          <time dateTime={message.date_creation} className="flex-shrink-0 text-[12px] text-[var(--color-text-secondary)]">
                            {formaterDateListe(message.date_creation)}
                          </time>
                        </span>
                        <span className="truncate text-[13px] text-[var(--color-text-primary)]">{message.sujet}</span>
                        <span className="line-clamp-2 text-[12.5px] leading-5 text-[var(--color-text-secondary)]">
                          {message.message}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {data && data.meta.totalPages > 1 ? (
            <TablePagination meta={data.meta} onChangerPage={setPage} />
          ) : null}
        </div>

        {/* ---------- Lecture ---------- */}
        <div className="flex min-h-0 flex-col">
          {selection ? (
            <>
              <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-4">
                <h2 className="min-w-0 break-words text-[20px] font-semibold leading-7 text-[var(--color-text-primary)] [overflow-wrap:anywhere]">
                  {selection.sujet}
                </h2>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <a
                    href={`mailto:${selection.email}?subject=${encodeURIComponent(`Re: ${selection.sujet}`)}`}
                    aria-label="Répondre"
                    title="Répondre"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                  >
                    <Reply className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    aria-label="Supprimer le message"
                    title="Supprimer"
                    onClick={() => setASupprimer(selection)}
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--status-expire-fg)] hover:bg-[var(--color-page-bg)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="flex items-start gap-3.5 border-b border-[var(--color-border)] pb-5">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--color-active-zone)] text-[13px] font-bold text-[var(--color-brand)]"
                  >
                    {initiales(selection.nom)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                      <span className="font-semibold text-[var(--color-text-primary)]">{selection.nom}</span>
                      <a href={`mailto:${selection.email}`} className="break-all text-[13px] text-[var(--color-text-secondary)] hover:underline">
                        &lt;{selection.email}&gt;
                      </a>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-[var(--color-text-secondary)]">
                      <Building2 className="h-3.5 w-3.5" />
                      À : {selection.destinataire
                        ? `${selection.destinataire.nom}${selection.destinataire.sigle ? ` (${selection.destinataire.sigle})` : ""}`
                        : "Présidence de l'Université"}
                    </p>
                    {selection.telephone ? (
                      <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                        <Phone className="h-3.5 w-3.5" />
                        <a href={`tel:${selection.telephone}`} className="hover:underline">{selection.telephone}</a>
                      </p>
                    ) : null}
                  </div>
                  <time dateTime={selection.date_creation} className="whitespace-nowrap text-[13px] text-[var(--color-text-secondary)]">
                    {formaterDate(selection.date_creation)}
                  </time>
                </div>

                <div className="whitespace-pre-wrap break-words pt-6 text-[15px] leading-7 text-[var(--color-text-primary)] [overflow-wrap:anywhere]">
                  {selection.message}
                </div>

                <p className="mt-8 font-mono text-[12px] text-[var(--color-text-secondary)]">{selection.reference}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <MailOpen className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
              <p className="text-sm text-[var(--color-text-secondary)]">Sélectionnez un message pour le lire.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bouton rond en bas à droite : actualise la boîte, l'icône tourne en continu */}
      <button
        type="button"
        onClick={() => queryClient.invalidateQueries({ queryKey: ["messages-contact"] })}
        aria-label="Actualiser les messages"
        title="Actualiser"
        className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[var(--color-brand)] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
      >
        <RefreshCw
          className={cn("h-5 w-5 animate-[spin_6s_linear_infinite]", isFetching && "animate-[spin_1s_linear_infinite]")}
        />
      </button>

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
