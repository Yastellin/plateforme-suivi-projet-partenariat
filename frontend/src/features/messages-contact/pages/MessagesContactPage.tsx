// src/features/messages-contact/pages/MessagesContactPage.tsx
import { useState } from "react"
import { toast } from "sonner"
import { Mail, Phone, Building2, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"
import {
  useMarquerMessageLu,
  useMessagesContact,
  useSupprimerMessageContact,
  type FiltreLecture,
} from "@/features/messages-contact/api/useMessagesContact"
import type { MessageContact } from "@/types/api"

const formaterDate = (valeur: string) =>
  new Date(valeur).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })

// Initiales de l'expediteur pour l'avatar (ex. « Jean Rakoto » -> « JR »)
const initiales = (nom: string) => {
  const morceaux = nom.trim().split(/\s+/).filter(Boolean)
  if (morceaux.length >= 2) return `${morceaux[0][0]}${morceaux[1][0]}`.toUpperCase()
  return (morceaux[0] ?? "?").slice(0, 2).toUpperCase()
}

function Avatar({ nom, taille = "h-10 w-10 text-sm" }: { nom: string; taille?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid flex-shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-primary",
        taille,
      )}
    >
      {initiales(nom)}
    </span>
  )
}

// Boite de reception des messages du formulaire de contact public.
// La Presidence voit tous les messages ; un etablissement ne voit que
// ceux qui lui sont destines (filtre applique par l'API).
export function MessagesContactPage() {
  const [filtre, setFiltre] = useState<FiltreLecture>("non-lus")
  const [page, setPage] = useState(1)
  const [selectionId, setSelectionId] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<MessageContact | null>(null)

  const { data, isLoading } = useMessagesContact(filtre, page)
  const marquerLu = useMarquerMessageLu()
  const supprimer = useSupprimerMessageContact()

  const messages = data?.data ?? []
  const selection: MessageContact | undefined =
    messages.find((m) => m.id === selectionId) ?? messages[0]

  function ouvrir(message: MessageContact) {
    setSelectionId(message.id)
    if (!message.est_lu) marquerLu.mutate(message.id)
  }

  function confirmerSuppression() {
    if (!aSupprimer) return
    const id = aSupprimer.id
    supprimer.mutate(id, {
      onSuccess: () => {
        toast.success("Message supprimé")
        if (selectionId === id) setSelectionId(null)
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

      <div className="flex gap-2">
        {(["non-lus", "tous"] as FiltreLecture[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtre === f ? "default" : "outline"}
            className="rounded-full"
            onClick={() => {
              setFiltre(f)
              setPage(1)
              setSelectionId(null)
            }}
          >
            {f === "non-lus" ? "Non lus" : "Tous"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-3" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-card px-6 py-24 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-full bg-muted">
            <Mail className="h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold text-foreground">Aucun message</p>
            <p className="text-sm text-muted-foreground">
              {filtre === "non-lus" ? "Aucun message non lu." : "Aucun message reçu pour le moment."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
            {messages.map((m) => {
              const actif = selection?.id === m.id
              return (
                <article
                  key={m.id}
                  className={cn(
                    "relative flex min-w-0 flex-col gap-2.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent/40",
                    !m.est_lu && "border-l-4 border-l-primary",
                    actif ? "border-primary/40 ring-1 ring-primary/30" : "border-border",
                  )}
                >
                  {/* Zone cliquable : toute la carte ouvre le message */}
                  <button
                    type="button"
                    onClick={() => ouvrir(m)}
                    aria-label={`Ouvrir le message de ${m.nom} : ${m.sujet}`}
                    className="absolute inset-0 rounded-xl"
                  />

                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar nom={m.nom} taille="h-9 w-9 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-[14px]", !m.est_lu ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>
                        {m.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <time dateTime={m.date_creation} className="shrink-0 text-xs text-muted-foreground">
                      {formaterDate(m.date_creation)}
                    </time>
                  </div>

                  <p className="line-clamp-2 break-words text-[14px] font-medium leading-5 text-foreground [overflow-wrap:anywhere]">
                    {m.sujet}
                  </p>
                  <p className="line-clamp-2 break-words text-[13px] leading-5 text-muted-foreground [overflow-wrap:anywhere]">
                    {m.message}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {m.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => setASupprimer(m)}
                      aria-label={`Supprimer le message de ${m.nom}`}
                      className="relative z-10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="min-w-0 lg:col-span-3">
            {selection ? (
              <Card>
                <CardContent className="flex flex-col gap-6 p-6">
                  {/* En-tete : expediteur, statut de lecture et actions */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar nom={selection.nom} taille="h-14 w-14 text-lg" />
                      <div className="min-w-0">
                        <p className="break-words text-lg font-semibold text-foreground">{selection.nom}</p>
                        <a
                          className="block break-all text-sm text-primary hover:underline"
                          href={`mailto:${selection.email}?subject=${encodeURIComponent(`Re: ${selection.sujet}`)}`}
                        >
                          {selection.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selection.est_lu ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          <CheckCheck size={12} /> Lu
                          {selection.date_lecture ? ` le ${formaterDate(selection.date_lecture)}` : ""}
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => marquerLu.mutate(selection.id)} disabled={marquerLu.isPending}>
                          Marquer comme lu
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setASupprimer(selection)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </Button>
                    </div>
                  </div>

                  {/* Sujet et reference */}
                  <div className="flex flex-col gap-2 border-t border-border pt-5">
                    <h2 className="font-heading break-words text-xl font-semibold leading-7 text-foreground [overflow-wrap:anywhere]">
                      {selection.sujet}
                    </h2>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground">{selection.reference}</span>
                      <span>Reçu le {formaterDate(selection.date_creation)}</span>
                    </p>
                  </div>

                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Destinataire</dt>
                      <dd className="mt-1 flex min-w-0 items-center gap-1.5 break-words text-[15px] font-medium text-foreground">
                        <Building2 size={14} className="flex-shrink-0 text-primary" />
                        {selection.destinataire
                          ? `${selection.destinataire.nom}${selection.destinataire.sigle ? ` (${selection.destinataire.sigle})` : ""}`
                          : "Présidence de l'Université"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border p-3.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Téléphone</dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-[15px]">
                        {selection.telephone ? (
                          <>
                            <Phone size={14} className="text-muted-foreground" />
                            <a className="font-medium text-primary hover:underline" href={`tel:${selection.telephone}`}>{selection.telephone}</a>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Non renseigné</span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <section aria-label="Message" className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Message</h3>
                    <div className="min-w-0 whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/40 p-5 text-[15px] leading-7 text-foreground [overflow-wrap:anywhere]">
                      {selection.message}
                    </div>
                  </section>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <span className="text-sm text-muted-foreground">Page {page} / {data.meta.totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      )}

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
