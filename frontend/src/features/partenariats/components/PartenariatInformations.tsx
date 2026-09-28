// src/features/partenariats/components/PartenariatInformations.tsx

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formaterDate } from '@/lib/format';
import { LIBELLES_DOMAINE_PARTENARIAT } from '@/lib/status-mappings';
import type { Partenariat } from '@/types/api';
import { CHAMPS_SUIVI } from '../lib/champs-suivi';

interface PartenariatInformationsProps {
  partenariat: Partenariat;
  cheminBase: string;
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-[15px] font-bold">{titre}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Champ({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{libelle}</dt>
      <dd className="mt-1 whitespace-pre-line text-[13.5px]">{children}</dd>
    </div>
  );
}

export function PartenariatInformations({ partenariat, cheminBase }: PartenariatInformationsProps) {
  const champsSuiviRenseignes = CHAMPS_SUIVI.filter((champ) => partenariat[champ.cle]);

  return (
    <div className="flex flex-col gap-5">
      <Section titre="Informations générales">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Domaine">{LIBELLES_DOMAINE_PARTENARIAT[partenariat.domaine]}</Champ>
          <Champ libelle="Période">
            <span className="font-mono text-[12.5px]">
              {formaterDate(partenariat.date_debut)}
              {partenariat.date_fin ? ` au ${formaterDate(partenariat.date_fin)}` : ' (sans date de fin)'}
            </span>
          </Champ>
          <div className="sm:col-span-2">
            <Champ libelle="Objet">{partenariat.objet ?? 'Non renseigné'}</Champ>
          </div>
        </dl>
      </Section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Section titre="Établissements concernés">
          {partenariat.etablissements.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-secondary)]">Aucun établissement associé.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[13.5px]">
              {partenariat.etablissements.map((etablissement) => (
                <li key={etablissement.id}>
                  <span className="font-semibold">{etablissement.sigle ?? etablissement.nom}</span>
                  {etablissement.sigle ? (
                    <span className="text-[var(--color-text-secondary)]">{` ${etablissement.nom}`}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section titre="Partenaires concernés">
          {partenariat.partenaires.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-secondary)]">Aucun partenaire associé.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[13.5px]">
              {partenariat.partenaires.map((partenaire) => (
                <li key={partenaire.id}>
                  <Link
                    to={`${cheminBase}/partenaires-partenariats/partenaires/${partenaire.id}`}
                    className="font-semibold text-[var(--color-brand)] hover:underline"
                  >
                    {partenaire.nom}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {champsSuiviRenseignes.length > 0 ? (
        <Section titre="Suivi">
          <dl className="flex flex-col gap-4">
            {champsSuiviRenseignes.map((champ) => (
              <Champ key={champ.cle} libelle={champ.libelle}>
                {partenariat[champ.cle]}
              </Champ>
            ))}
          </dl>
        </Section>
      ) : null}
    </div>
  );
}