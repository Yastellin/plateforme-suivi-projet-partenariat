// src/features/partenaires/components/PartenaireCoordonnees.tsx

import type { LucideIcon } from 'lucide-react';
import { Globe, Mail, Phone } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/shared/Panel';
import type { Partenaire } from '@/types/api';

interface PartenaireCoordonneesProps {
  partenaire: Partenaire;
}

interface LigneCoordonnee {
  cle: string;
  icone: LucideIcon;
  valeur: string;
  estLien: boolean;
}

const CLASSE_LIEN = 'break-all text-[var(--color-brand)] hover:underline';

function construireLignes(partenaire: Partenaire): LigneCoordonnee[] {
  const lignes: LigneCoordonnee[] = [];

  if (partenaire.email) {
    lignes.push({ cle: 'email', icone: Mail, valeur: partenaire.email, estLien: false });
  }
  if (partenaire.telephone) {
    lignes.push({ cle: 'telephone', icone: Phone, valeur: partenaire.telephone, estLien: false });
  }
  if (partenaire.site_web) {
    lignes.push({ cle: 'site_web', icone: Globe, valeur: partenaire.site_web, estLien: true });
  }

  return lignes;
}

export function PartenaireCoordonnees({ partenaire }: PartenaireCoordonneesProps) {
  const lignes = construireLignes(partenaire);

  return (
    <Panel>
      <PanelHeader titre="Coordonnées" />
      <PanelBody className="flex flex-col gap-3 text-[13px]">
        {lignes.length === 0 ? (
          <p className="text-[var(--color-text-secondary)]">Aucune coordonnée renseignée.</p>
        ) : (
          lignes.map((ligne) => {
            const Icone = ligne.icone;

            return (
              <div key={ligne.cle} className="flex items-center gap-2.5">
                <Icone className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-secondary)]" />
                {ligne.estLien ? (
                  <a href={ligne.valeur} target="_blank" rel="noreferrer" className={CLASSE_LIEN}>{ligne.valeur}</a>
                ) : (
                  <span className="break-all">{ligne.valeur}</span>
                )}
              </div>
            );
          })
        )}
      </PanelBody>
    </Panel>
  );
}