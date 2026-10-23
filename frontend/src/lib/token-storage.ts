// src/lib/token-storage.ts

const REFRESH_TOKEN_KEY = 'uf_refresh_token';

/**
 * Le jeton reste limité à l'onglet par défaut. Il n'est conservé entre deux
 * sessions du navigateur que lorsque l'utilisateur active « Se souvenir de moi ».
 */
export const tokenStorage = {
  getRefreshToken(): string | null {
    return (
      localStorage.getItem(REFRESH_TOKEN_KEY) ??
      sessionStorage.getItem(REFRESH_TOKEN_KEY)
    );
  },

  estPersistant(): boolean {
    return localStorage.getItem(REFRESH_TOKEN_KEY) !== null;
  },

  setRefreshToken(token: string, persistant = false): void {
    const cible = persistant ? localStorage : sessionStorage;
    const autre = persistant ? sessionStorage : localStorage;

    autre.removeItem(REFRESH_TOKEN_KEY);
    cible.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
