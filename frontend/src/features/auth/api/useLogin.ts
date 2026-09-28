// src/features/auth/api/useLogin.ts

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ConnexionReponse } from '@/types/api';

interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
}

async function connecterCompte({ email, motDePasse }: IdentifiantsConnexion): Promise<ConnexionReponse> {
  const reponse = await apiClient.post<ConnexionReponse>('/auth/login', {
    email,
    mot_de_passe: motDePasse,
  });
  return reponse.data;
}

export function useLogin() {
  return useMutation({ mutationFn: connecterCompte });
}