// src/lib/api-client.ts

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ReponseApi } from '@/types/api';
import { estPayloadNormalisable, normaliserPayload } from './payload';
import { tokenStorage } from './token-storage';

const API_BASE_URL = import.meta.env.VITE_API_URL;

let accessToken: string | null = null;

export function definirAccessToken(token: string | null): void {
  accessToken = token;
}

export function obtenirAccessToken(): string | null {
  return accessToken;
}

interface RequeteAvecRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RafraichissementReponse {
  access_token: string;
  refresh_token: string;
}

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Champs de formulaire vides -> null, pour tous les endpoints (hors uploads).
  if (estPayloadNormalisable(config.data)) {
    config.data = normaliserPayload(config.data);
  }

  return config;
});

// Un seul rafraîchissement à la fois, même si plusieurs requêtes échouent en parallèle
let refreshPromise: Promise<string> | null = null;

async function rafraichirToken(refreshToken: string): Promise<string> {
  const reponse = await axios.post<ReponseApi<RafraichissementReponse | null>>(
    `${API_BASE_URL}/auth/refresh`,
    { refresh_token: refreshToken },
  );

  const contenu = reponse.data.data;
  if (!contenu) {
    throw new Error('Réponse de rafraîchissement invalide.');
  }

  tokenStorage.setRefreshToken(contenu.refresh_token);
  return contenu.access_token;
}

apiClient.interceptors.response.use(
  (reponse) => {
    // Les fichiers (téléchargements en blob) ne sont pas enveloppés dans { status, data }
    if (reponse.config.responseType === "blob") {
      return reponse;
    }
    const enveloppe = reponse.data as ReponseApi<unknown>;
    if (enveloppe.status === 'error') {
      return Promise.reject(new Error(enveloppe.message));
    }
    return { ...reponse, data: enveloppe.data };
  },
  async (erreur: AxiosError<ReponseApi<unknown>>) => {
    const requeteOriginale = erreur.config as RequeteAvecRetry | undefined;

    if (erreur.response?.status === 401 && requeteOriginale && !requeteOriginale._retry) {
      const refreshToken = tokenStorage.getRefreshToken();
      const estRequeteRefresh = requeteOriginale.url?.includes('/auth/refresh');

      if (refreshToken && !estRequeteRefresh) {
        requeteOriginale._retry = true;

        if (!refreshPromise) {
          refreshPromise = rafraichirToken(refreshToken)
            .then((nouveauToken) => {
              definirAccessToken(nouveauToken);
              return nouveauToken;
            })
            .catch((erreurRefresh) => {
              tokenStorage.clearRefreshToken();
              definirAccessToken(null);
              window.location.assign('/connexion');
              throw erreurRefresh;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          const nouveauToken = await refreshPromise;
          requeteOriginale.headers.set('Authorization', `Bearer ${nouveauToken}`);
          return apiClient(requeteOriginale);
        } catch {
          return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
        }
      }

      definirAccessToken(null);
      tokenStorage.clearRefreshToken();
      if (window.location.pathname !== '/connexion') {
        window.location.assign('/connexion');
      }
    }

    const message = erreur.response?.data?.message ?? 'Une erreur réseau est survenue. Vérifiez votre connexion.';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;