// src/features/partenaires/components/PartenaireCoordonnees.tsx

import type { LucideIcon } from 'lucide-react';
import { Globe, Mail, Phone } from 'lucide-react';
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
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-[15px] font-bold">Coordonnées</h3>
      </div>

      <div className="flex flex-col gap-3 p-5 text-[13px]">
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
      </div>
    </section>
  );
}