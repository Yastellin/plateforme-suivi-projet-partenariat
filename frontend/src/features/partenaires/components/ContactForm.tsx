// src/features/partenaires/components/ContactForm.tsx
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TextInputSanitized } from "@/components/forms/inputs/TextInputSanitized"
import { PhoneInputSanitized } from "@/components/forms/inputs/PhoneInputSanitized"
import { EmailInput } from "@/components/forms/inputs/EmailInput"
import { schemaContact, type ContactFormValues } from "@/lib/validators/contact.schema"
import { useCreerContact, useModifierContact } from "@/features/partenaires/api/useContacts"
import type { Contact } from "@/types/api"

interface ContactFormProps {
  partenaireId: string
  contact?: Contact
  onSucces: () => void
  onAnnuler: () => void
}

// Formulaire d'ajout ou de modification d'un contact rattache a un
// partenaire (RG28) : validation temps reel via Zod + react-hook-form.
export function ContactForm({ partenaireId, contact, onSucces, onAnnuler }: ContactFormProps) {
  const creation = useCreerContact(partenaireId)
  const modification = useModifierContact(partenaireId)
  const enCours = creation.isPending || modification.isPending

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schemaContact),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nom: contact?.nom ?? "",
      fonction: contact?.fonction ?? "",
      email: contact?.email ?? "",
      telephone: contact?.telephone ?? "",
    },
  })

  useEffect(() => {
    reset({
      nom: contact?.nom ?? "",
      fonction: contact?.fonction ?? "",
      email: contact?.email ?? "",
      telephone: contact?.telephone ?? "",
    })
  }, [contact, reset])

  const onSubmit = (valeurs: ContactFormValues) => {
    const reinitialiserApresSucces = () => {
      reset(valeurs)
      onSucces()
    }
    if (contact) {
      modification.mutate(
        { id: contact.id, partenaireId, valeurs },
        { onSuccess: reinitialiserApresSucces }
      )
    } else {
      creation.mutate({ partenaireId, valeurs }, { onSuccess: reinitialiserApresSucces })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-nom" requis>Nom complet</Label>
        <TextInputSanitized
          id="contact-nom"
          maxLength={100}
          caracteresInterdits={/[^a-zA-ZÀ-ÿ\s]/g}
          aria-invalid={!!errors.nom}
          {...register("nom")}
        />
        {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-fonction">Fonction</Label>
        <TextInputSanitized
          id="contact-fonction"
          maxLength={255}
          aria-invalid={!!errors.fonction}
          {...register("fonction")}
        />
        {errors.fonction && <p className="text-sm text-destructive">{errors.fonction.message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <EmailInput id="contact-email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-telephone">Telephone</Label>
          <Controller
            control={control}
            name="telephone"
            render={({ field }) => (
              <PhoneInputSanitized
                id="contact-telephone"
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={!!errors.telephone}
              />
            )}
          />
          {errors.telephone && <p className="text-sm text-destructive">{errors.telephone.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onAnnuler} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" disabled={enCours || !isValid}>
          {enCours && <LoaderCircle className="animate-spin" />}
          {contact ? "Enregistrer" : "Ajouter le contact"}
        </Button>
      </div>
    </form>
  )
}
