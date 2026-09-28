// src/features/partenaires/api/useContacts.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { videsEnNull } from '@/lib/payload';
import { normaliserTelephone } from '@/lib/validators/phone.schema';
import type { Contact } from '@/types/api';
import type { ContactFormValues } from '@/lib/validators/partenaire.schema';

function preparerPayloadContact(valeurs: ContactFormValues): Record<string, unknown> {
  const { telephone, ...reste } = valeurs;
  return {
    ...videsEnNull(reste),
    telephone: telephone ? normaliserTelephone(telephone) : null,
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