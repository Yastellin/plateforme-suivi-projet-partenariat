// src/features/partenaires/pages/PartenaireDetailPage.tsx
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { PartenaireForm } from "@/features/partenaires/components/PartenaireForm"
import { ContactForm } from "@/features/partenaires/components/ContactForm"
import { usePartenaire } from "@/features/partenaires/api/usePartenaire"
import { useArchiverPartenaire } from "@/features/partenaires/api/useArchiverPartenaire"
import { useSupprimerContact } from "@/features/partenaires/api/useContacts"
import { useAuth } from "@/hooks/useAuth"
import type { Contact } from "@/types/api"

type DialogueContact = { mode: "ajout" } | { mode: "edition"; contact: Contact } | null

export function PartenaireDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const estPresidence = utilisateur?.role === "PRESIDENCE"

  const { data: partenaire, isLoading, isError } = usePartenaire(id)

  const [dialogueEdition, setDialogueEdition] = useState(false)
  const [dialogueArchivage, setDialogueArchivage] = useState(false)
  const [dialogueContact, setDialogueContact] = useState<DialogueContact>(null)
  const [contactASupprimer, setContactASupprimer] = useState<Contact | null>(null)

  const archiver = useArchiverPartenaire()
  const supprimerContact = useSupprimerContact(partenaire?.id ?? "")

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonCard />
      </div>
    )
  }

  if (isError || !partenaire) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Building2}
          titre="Partenaire introuvable"
          message="Ce partenaire n'existe pas ou n'est pas accessible depuis votre compte."
          action={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft />
              Retour
            </Button>
          }
        />
      </div>
    )
  }

  const baseChemin = estPresidence
    ? "/presidence/partenaires-partenariats/partenaires"
    : "/etablissement/partenaires-partenariats/partenaires"

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour">
            <ArrowLeft />
          </Button>
          <h1 className="font-heading text-xl font-semibold">{partenaire.nom}</h1>
          <StatusBadge statut={partenaire.statut} />
          {partenaire.est_strategique && (
            <Badge variant="secondary" className="gap-1">
              <Star size={12} className="fill-current" />
              Strategique
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogueEdition(true)}>
            <Pencil />
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => setDialogueArchivage(true)}>
            Archiver
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {partenaire.logo_url ? (
                <img
                  src={partenaire.logo_url}
                  alt={`Logo de ${partenaire.nom}`}
                  className="size-16 rounded-lg border border-border object-contain p-1"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg bg-accent font-heading text-base font-bold text-accent-foreground">
                  {partenaire.nom.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{partenaire.type}</span>
                <span className="text-sm text-muted-foreground">{partenaire.pays}</span>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 text-sm">
              {partenaire.adresse && (
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  {partenaire.adresse}
                </span>
              )}
              {partenaire.telephone && (
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  {partenaire.telephone}
                </span>
              )}
              {partenaire.email && (
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  {partenaire.email}
                </span>
              )}
              {partenaire.site_web && (
                <a
                  href={partenaire.site_web}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe size={14} />
                  {partenaire.site_web}
                </a>
              )}
            </div>
            {partenaire.description && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">{partenaire.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="[.border-b]:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setDialogueContact({ mode: "ajout" })}>
                <Plus />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {partenaire.contacts && partenaire.contacts.length > 0 ? (
              partenaire.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{contact.nom}</span>
                    {contact.fonction && <span className="text-xs text-muted-foreground">{contact.fonction}</span>}
                    {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                    {contact.telephone && <span className="text-xs text-muted-foreground">{contact.telephone}</span>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Modifier le contact ${contact.nom}`}
                      onClick={() => setDialogueContact({ mode: "edition", contact })}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Supprimer le contact ${contact.nom}`}
                      onClick={() => setContactASupprimer(contact)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={UserPlus}
                titre="Aucun contact"
                message="Ajoutez une personne referente chez ce partenaire."
                action={
                  <Button variant="outline" size="sm" onClick={() => setDialogueContact({ mode: "ajout" })}>
                    <Plus />
                    Ajouter un contact
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogueEdition} onOpenChange={setDialogueEdition}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le partenaire</DialogTitle>
            <DialogDescription>Les modifications seront visibles immediatement.</DialogDescription>
          </DialogHeader>
          <PartenaireForm
            partenaire={partenaire}
            onSucces={() => {
              setDialogueEdition(false)
              toast.success("Partenaire mis a jour")
            }}
            onAnnuler={() => setDialogueEdition(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogueContact !== null} onOpenChange={(ouvert) => !ouvert && setDialogueContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogueContact?.mode === "edition" ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          {dialogueContact && (
            <ContactForm
              partenaireId={partenaire.id}
              contact={dialogueContact.mode === "edition" ? dialogueContact.contact : undefined}
              onSucces={() => {
                setDialogueContact(null)
                toast.success(dialogueContact.mode === "edition" ? "Contact mis a jour" : "Contact ajoute")
              }}
              onAnnuler={() => setDialogueContact(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        ouvert={contactASupprimer !== null}
        onOpenChange={(ouvert) => !ouvert && setContactASupprimer(null)}
        titre="Supprimer ce contact ?"
        description={`Le contact "${contactASupprimer?.nom ?? ""}" sera definitivement supprime. Cette action est irreversible.`}
        libelleConfirmation="Supprimer"
        variante="destructive"
        enCours={supprimerContact.isPending}
        onConfirmer={() => {
          if (contactASupprimer) {
            supprimerContact.mutate(contactASupprimer.id, {
              onSuccess: () => {
                setContactASupprimer(null)
                toast.success("Contact supprime")
              },
              onError: (erreur) => toast.error(erreur.message),
            })
          }
        }}
      />

      <ConfirmDialog
        ouvert={dialogueArchivage}
        onOpenChange={setDialogueArchivage}
        titre="Archiver ce partenaire ?"
        description="Le partenaire sera deplace dans les archives et ne sera plus modifiable. Vous pourrez toujours le consulter depuis la rubrique Archives."
        libelleConfirmation="Archiver"
        enCours={archiver.isPending}
        onConfirmer={() => {
          archiver.mutate(partenaire.id, {
            onSuccess: () => {
              toast.success("Partenaire archive")
              navigate(baseChemin)
            },
            onError: (erreur) => toast.error(erreur.message),
          })
        }}
      />
    </div>
  )
}
