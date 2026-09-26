// src/hooks/useAuth.tsx

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/AuthProvider';

export function useAuth(): AuthContextValue {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider.');
  }
  return contexte;
}