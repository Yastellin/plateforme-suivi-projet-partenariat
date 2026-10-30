// src/features/etablissements/components/TableauLiensEtablissement.tsx

import { Link } from "react-router-dom";
import { ArrowUpDown, ChevronRight, type LucideIcon } from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export interface LigneLienEtablissement {
  id: string;
  titre: string;
  sousTitre?: string | null;
  statut?: string | null;
  date?: string | null;
  lien: string;
}

interface TableauLiensEtablissementProps {
  titre: string;
  sousTitre?: string;
  icone: LucideIcon;
  libelleDate: string;
  lignes: LigneLienEtablissement[];
  messageVide: string;
}

const formaterDate = (valeur: string) => new Date(valeur).toLocaleDateString("fr-FR");

// Tableau « liste d'éléments liés » : icône à gauche, nom + sous-titre,
// statut, date et une flèche d'accès à la fiche.
export function TableauLiensEtablissement({
  titre,
  sousTitre,
  icone: Icone,
  libelleDate,
  lignes,
  messageVide,
}: TableauLiensEtablissementProps) {
  return (
    <Panel>
      <PanelHeader titre={titre} sousTitre={sousTitre} />
      <PanelBody className="p-0">
        {lignes.length === 0 ? (
          <p className="px-[18px] py-6 text-center text-[13px] text-[var(--color-text-secondary)]">{messageVide}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
              <thead>
                <tr className="border-y border-[var(--color-border)] bg-[var(--color-page-bg)] text-left text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
                  <th className="px-[18px] py-2.5 font-semibold">
                    <span className="inline-flex items-center gap-1">Nom <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-center gap-1">Statut <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" /></span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-center gap-1">{libelleDate} <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" /></span>
                  </th>
                  <th className="w-12 px-3 py-2.5" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => (
                  <tr
                    key={ligne.id}
                    className="group border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-[var(--color-active-zone)]"
                  >
                    <td className="px-[18px] py-3">
                      <Link to={ligne.lien} className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[var(--color-active-zone)] text-[var(--color-brand)]"
                        >
                          <Icone className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)]">
                            {ligne.titre}
                          </span>
                          <span className="block truncate font-mono text-[12px] text-[var(--color-text-secondary)]">
                            {ligne.sousTitre ?? "—"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      {ligne.statut ? <StatusBadge statut={ligne.statut} /> : <span className="text-[var(--color-text-secondary)]">—</span>}
                    </td>
                    <td className={cn("px-3 py-3 font-mono text-[12.5px] text-[var(--color-text-secondary)]")}>
                      {ligne.date ? formaterDate(ligne.date) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        to={ligne.lien}
                        aria-label={`Ouvrir ${ligne.titre}`}
                        className="inline-grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
