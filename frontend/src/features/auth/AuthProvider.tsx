// src/features/auth/AuthProvider.tsx

import { createContext, useEffect, useState, type ReactNode } from 'react';
import apiClient, { definirAccessToken } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';
import type { Utilisateur } from '@/types/api';

export interface AuthContextValue {
  utilisateur: Utilisateur | null;
  estCharge: boolean;
  connecter: (utilisateur: Utilisateur, accessToken: string, refreshToken: string) => void;
  deconnecter: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [estCharge, setEstCharge] = useState(true);

  useEffect(() => {
    let annule = false;

    async function restaurerSession() {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        setEstCharge(false);
        return;
      }

      try {
        const reponseRefresh = await apiClient.post<{ access_token: string }>('/auth/refresh', {
          refresh_token: refreshToken,
        });
        definirAccessToken(reponseRefresh.data.access_token);

        const reponseMe = await apiClient.get<Utilisateur>('/auth/me');
        if (!annule) {
          setUtilisateur(reponseMe.data);
        }
      } catch {
        tokenStorage.clearRefreshToken();
        definirAccessToken(null);
      } finally {
        if (!annule) {
          setEstCharge(false);
        }
      }
    }

    restaurerSession();

    return () => {
      annule = true;
    };
  }, []);

  function connecter(utilisateurConnecte: Utilisateur, accessToken: string, refreshToken: string) {
    definirAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    setUtilisateur(utilisateurConnecte);
  }

  function deconnecter() {
    definirAccessToken(null);
    tokenStorage.clearRefreshToken();
    setUtilisateur(null);
    window.location.assign('/connexion');
  }

  return (
    <AuthContext.Provider value={{ utilisateur, estCharge, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}