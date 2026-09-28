// src/components/layout/RouteProtegee.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/api';

interface RouteProtegeeProps {
  rolesAutorises?: Role[];
}

export function RouteProtegee({ rolesAutorises }: RouteProtegeeProps) {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();

  if (chargement) {
    return null;
  }

  if (!utilisateur) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/connexion?redirect=${redirect}`} replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}