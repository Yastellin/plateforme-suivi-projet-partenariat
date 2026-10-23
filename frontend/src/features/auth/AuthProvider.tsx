// src/features/auth/AuthProvider.tsx

import { createContext, useEffect, useState, type ReactNode } from 'react';
import apiClient, { definirAccessToken } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';
import type { Utilisateur } from '@/types/api';
import { useTheme } from '@/hooks/useTheme';

export interface AuthContextValue {
  utilisateur: Utilisateur | null;
  estCharge: boolean;
  connecter: (
    utilisateur: Utilisateur,
    accessToken: string,
    refreshToken: string,
    seSouvenir?: boolean,
  ) => void;
  deconnecter: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface RafraichissementReponse {
  access_token: string;
  refresh_token: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { definirTheme } = useTheme();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [estCharge, setEstCharge] = useState(true);

  useEffect(() => {
    const preference = utilisateur?.preferences?.theme;
    if (preference) {
      const theme =
        preference === 'SOMBRE'
          ? 'dark'
          : preference === 'CLAIR'
            ? 'light'
            : window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
      definirTheme(theme);
    }
    document.documentElement.dataset.density = utilisateur?.preferences?.densite ?? 'CONFORTABLE';
    document.documentElement.classList.toggle('animations-reduites', utilisateur?.preferences?.animations === false);
    document.documentElement.dataset.aideContextuelle = String(utilisateur?.preferences?.aide_contextuelle !== false);
  }, [utilisateur?.preferences, definirTheme]);

  useEffect(() => {
    let annule = false;

    async function restaurerSession() {
      const refreshToken = tokenStorage.getRefreshToken();
      const sessionPersistante = tokenStorage.estPersistant();
      if (!refreshToken) {
        setEstCharge(false);
        return;
      }

      try {
        const reponseRefresh = await apiClient.post<RafraichissementReponse>('/auth/refresh', {
          refresh_token: refreshToken,
        });
        definirAccessToken(reponseRefresh.data.access_token);
        tokenStorage.setRefreshToken(
          reponseRefresh.data.refresh_token,
          sessionPersistante,
        );

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

  function connecter(
    utilisateurConnecte: Utilisateur,
    accessToken: string,
    refreshToken: string,
    seSouvenir = false,
  ) {
    definirAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken, seSouvenir);
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