// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { tokenStorage } from '@/lib/token-storage';

const CLE_JETON = 'uf_refresh_token';

describe('stockage du jeton de session', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('limite le jeton à la session lorsque la mémorisation est désactivée', () => {
    tokenStorage.setRefreshToken('jeton-session');

    expect(sessionStorage.getItem(CLE_JETON)).toBe('jeton-session');
    expect(localStorage.getItem(CLE_JETON)).toBeNull();
    expect(tokenStorage.estPersistant()).toBe(false);
    expect(tokenStorage.getRefreshToken()).toBe('jeton-session');
  });

  it('conserve le jeton dans le navigateur lorsque la mémorisation est activée', () => {
    tokenStorage.setRefreshToken('ancien-jeton');
    tokenStorage.setRefreshToken('jeton-persistant', true);

    expect(localStorage.getItem(CLE_JETON)).toBe('jeton-persistant');
    expect(sessionStorage.getItem(CLE_JETON)).toBeNull();
    expect(tokenStorage.estPersistant()).toBe(true);
    expect(tokenStorage.getRefreshToken()).toBe('jeton-persistant');
  });

  it('supprime le jeton des deux stockages à la déconnexion', () => {
    localStorage.setItem(CLE_JETON, 'local');
    sessionStorage.setItem(CLE_JETON, 'session');

    tokenStorage.clearRefreshToken();

    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});
