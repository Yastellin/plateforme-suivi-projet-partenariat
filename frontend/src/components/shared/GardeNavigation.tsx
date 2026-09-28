// src/components/shared/GardeNavigation.tsx

import { useBlocker } from 'react-router-dom';
import { ConfirmDialog } from './ConfirmDialog';

interface GardeNavigationProps {
  doitBloquer: () => boolean;
}

export function GardeNavigation({ doitBloquer }: GardeNavigationProps) {
  const blocage = useBlocker(
    ({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && doitBloquer(),
  );

  return (
    <ConfirmDialog
      ouvert={blocage.state === 'blocked'}
      onFermer={() => {
        if (blocage.state === 'blocked') {
          blocage.reset();
        }
      }}
      onConfirmer={() => {
        if (blocage.state === 'blocked') {
          blocage.proceed();
        }
      }}
      titre="Quitter sans enregistrer"
      description="Les modifications non enregistrées seront perdues."
      libelleAction="Quitter"
      libelleAnnulation="Rester sur la page"
    />
  );
}