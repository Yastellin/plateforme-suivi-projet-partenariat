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

/**
 * React exécute les effets deux fois en développement sous StrictMode. La
 * restauration est donc partagée au niveau du module afin de ne jamais faire
 * tourner deux fois le même jeton de renouvellement en parallèle.
 */
let restaurationSession: {
  refreshToken: string;
  promesse: Promise<Utilisateur | null>;
} | null = null;

function restaurerSessionUneFois(): Promise<Utilisateur | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);
  if (restaurationSession?.refreshToken === refreshToken) {
    return restaurationSession.promesse;
  }

  const sessionPersistante = tokenStorage.estPersistant();
  const promesse = (async () => {
    try {
      const reponseRefresh = await apiClient.post<RafraichissementReponse>(
        '/auth/refresh',
        { refresh_token: refreshToken },
      );
      definirAccessToken(reponseRefresh.data.access_token);
      tokenStorage.setRefreshToken(
        reponseRefresh.data.refresh_token,
        sessionPersistante,
      );

      const reponseMe = await apiClient.get<Utilisateur>('/auth/me');
      return reponseMe.data;
    } catch {
      tokenStorage.clearRefreshToken();
      definirAccessToken(null);
      return null;
    }
  })();

  restaurationSession = { refreshToken, promesse };
  return promesse;
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
    let actif = true;

    void restaurerSessionUneFois().then((sessionRestauree) => {
      if (!actif) return;
      setUtilisateur(sessionRestauree);
      setEstCharge(false);
    });

    return () => {
      actif = false;
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