// src/features/partenaires/api/useContacts.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { normaliserEmail, normaliserNomPersonne } from '@/lib/normalisation';
import { normaliserTelephone } from '@/lib/phone';
import type { Contact } from '@/types/api';
import type { ContactFormValues } from '@/lib/validators/contact.schema';

// Le contrat API contact ne comporte que { nom, fonction, email, telephone } :
// le champ prenom n'existe pas cote backend (table "Contact" sans colonne prenom).
function preparerPayloadContact(valeurs: ContactFormValues): Record<string, unknown> {
  return {
    nom: normaliserNomPersonne(valeurs.nom),
    fonction: valeurs.fonction || null,
    email: valeurs.email ? normaliserEmail(valeurs.email) : null,
    telephone: valeurs.telephone ? normaliserTelephone(valeurs.telephone) : null,
  };
}

interface VariablesCreerContact {
  partenaireId: string;
  valeurs: ContactFormValues;
}

async function creerContact({ partenaireId, valeurs }: VariablesCreerContact): Promise<Contact> {
  const reponse = await apiClient.post<Contact>(
    `/partenaires/${partenaireId}/contacts`,
    preparerPayloadContact(valeurs),
  );
  return reponse.data;
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creerContact,
    onSuccess: (_contact, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partenaires', variables.partenaireId] });
    },
  });
}

export function useCreerContact(_partenaireId?: string) {
  return useCreateContact();
}

interface VariablesModifierContact {
  id: string;
  partenaireId: string;
  valeurs: ContactFormValues;
}

async function modifierContact({ id, valeurs }: VariablesModifierContact): Promise<Contact> {
  const reponse = await apiClient.patch<Contact>(`/contacts/${id}`, preparerPayloadContact(valeurs));
  return reponse.data;
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modifierContact,
    onSuccess: (_contact, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partenaires', variables.partenaireId] });
    },
  });
}

export function useModifierContact(_partenaireId?: string) {
  return useUpdateContact();
}

interface VariablesSupprimerContact {
  id: string;
  partenaireId: string;
}

async function supprimerContact({ id }: VariablesSupprimerContact): Promise<void> {
  await apiClient.delete(`/contacts/${id}`);
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supprimerContact,
    onSuccess: (_reponse, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partenaires', variables.partenaireId] });
    },
  });
}