// src/features/messages-contact/pages/MessagesContactPage.tsx
import { useState } from "react"
import { Mail, MailOpen, Phone, Building2, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"
import {
  useMarquerMessageLu,
  useMessagesContact,
  type FiltreLecture,
} from "@/features/messages-contact/api/useMessagesContact"
import type { MessageContact } from "@/types/api"

const formaterDate = (valeur: string) =>
  new Date(valeur).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })

// Boite de reception des messages du formulaire de contact public.
// La Presidence voit tous les messages ; un etablissement ne voit que
// ceux qui lui sont destines (filtre applique par l'API).
export function MessagesContactPage() {
  const [filtre, setFiltre] = useState<FiltreLecture>("non-lus")
  const [page, setPage] = useState(1)
  const [selectionId, setSelectionId] = useState<string | null>(null)

  const { data, isLoading } = useMessagesContact(filtre, page)
  const marquerLu = useMarquerMessageLu()

  const messages = data?.data ?? []
  const selection: MessageContact | undefined =
    messages.find((m) => m.id === selectionId) ?? messages[0]

  function ouvrir(message: MessageContact) {
    setSelectionId(message.id)
    if (!message.est_lu) marquerLu.mutate(message.id)
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

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : messages.length === 0 ? (
            <EmptyState
              icone={Mail}
              titre="Aucun message"
              description={filtre === "non-lus" ? "Aucun message non lu." : "Aucun message reçu pour le moment."}
            />
          ) : (
            messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => ouvrir(m)}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50",
                  selection?.id === m.id ? "border-primary/40 ring-1 ring-primary/30" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("flex items-center gap-2 truncate text-sm", !m.est_lu && "font-semibold")}>
                    {m.est_lu ? <MailOpen size={14} className="text-muted-foreground" /> : <Mail size={14} className="text-primary" />}
                    {m.nom}
                  </span>
                  <time className="shrink-0 text-xs text-muted-foreground">{formaterDate(m.date_creation)}</time>
                </div>
                <p className="truncate text-sm text-foreground">{m.sujet}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          {selection ? (
            <Card>
              <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-foreground">{selection.sujet}</h2>
                    <p className="text-sm text-muted-foreground">
                      Reçu le {formaterDate(selection.date_creation)}
                    </p>
                  </div>
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
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Expéditeur</dt>
                    <dd className="font-medium">{selection.nom}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Destinataire</dt>
                    <dd className="flex items-center gap-1.5 font-medium">
                      <Building2 size={14} className="text-primary" />
                      {selection.destinataire
                        ? `${selection.destinataire.nom}${selection.destinataire.sigle ? ` (${selection.destinataire.sigle})` : ""}`
                        : "Présidence de l'Université"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">E-mail</dt>
                    <dd>
                      <a className="text-primary hover:underline" href={`mailto:${selection.email}?subject=${encodeURIComponent(`Re: ${selection.sujet}`)}`}>
                        {selection.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Téléphone</dt>
                    <dd className="flex items-center gap-1.5">
                      {selection.telephone ? (
                        <>
                          <Phone size={14} className="text-muted-foreground" />
                          <a className="text-primary hover:underline" href={`tel:${selection.telephone}`}>{selection.telephone}</a>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Non renseigné</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                  {selection.message}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <span className="text-sm text-muted-foreground">Page {page} / {data.meta.totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
