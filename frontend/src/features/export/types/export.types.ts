import { z } from 'zod';

export const PORTÉES_EXPORT = [
  'TOUT',
  'CONVENTIONS',
  'PROJETS',
  'PARTENARIATS',
  'PARTENAIRES',
] as const;
export const MODES_PERIODE_EXPORT = ['TOUT', 'ANNEE', 'MOIS', 'INTERVALLE'] as const;
export const CHAMPS_DATE_EXPORT = ['SIGNATURE', 'DEBUT', 'FIN'] as const;
export const STATUTS_EXPORT = [
  'EN_COURS',
  'TERMINE',
  'EN_RETARD',
  'SUSPENDU',
  'EXPIRE',
] as const;
export const FORMATS_EXPORT = ['XLSX', 'CSV', 'PDF'] as const;

export const periodeExportSchema = z.object({
  mode: z.enum(MODES_PERIODE_EXPORT),
  champ_date: z.enum(CHAMPS_DATE_EXPORT),
  annee: z.number().int().min(1900).max(9999).optional(),
  mois: z.number().int().min(0).max(11).optional(),
  du: z.string().optional(),
  au: z.string().optional(),
});

export const filtresExportSchema = z
  .object({
    portee: z.enum(PORTÉES_EXPORT),
    periode: periodeExportSchema,
    statuts: z.array(z.enum(STATUTS_EXPORT)),
    format: z.enum(FORMATS_EXPORT),
  })
  .superRefine((filtres, contexte) => {
    const periode = filtres.periode;
    if ((periode.mode === 'ANNEE' || periode.mode === 'MOIS') && !periode.annee) {
      contexte.addIssue({
        code: 'custom',
        path: ['periode', 'annee'],
        message: 'Choisissez une année.',
      });
    }
    if (periode.mode === 'MOIS' && periode.mois === undefined) {
      contexte.addIssue({
        code: 'custom',
        path: ['periode', 'mois'],
        message: 'Choisissez un mois.',
      });
    }
    if (periode.mode === 'INTERVALLE') {
      if (!periode.du) {
        contexte.addIssue({
          code: 'custom',
          path: ['periode', 'du'],
          message: 'Choisissez une date de début.',
        });
      }
      if (!periode.au) {
        contexte.addIssue({
          code: 'custom',
          path: ['periode', 'au'],
          message: 'Choisissez une date de fin.',
        });
      }
      if (periode.du && periode.au && periode.au < periode.du) {
        contexte.addIssue({
          code: 'custom',
          path: ['periode', 'au'],
          message: 'La date « Au » doit être égale ou postérieure à « Du ».',
        });
      }
    }
  });

export type FiltresExport = z.infer<typeof filtresExportSchema>;
export type PorteeExport = (typeof PORTÉES_EXPORT)[number];
export type ModePeriodeExport = (typeof MODES_PERIODE_EXPORT)[number];
export type ChampDateExport = (typeof CHAMPS_DATE_EXPORT)[number];
export type StatutExport = (typeof STATUTS_EXPORT)[number];
export type FormatExport = (typeof FORMATS_EXPORT)[number];

export interface ApercuExport {
  portee: PorteeExport;
  date_apercu: string;
  total_lignes: number;
  par_entite: {
    conventions: number;
    projets: number;
    partenariats: number;
    partenaires: number;
  };
  formats: {
    XLSX: { nombre_fichiers: number; description: string };
    PDF: { nombre_fichiers: number; description: string };
    CSV: { nombre_fichiers: number; description: string; fichiers: string[] };
  };
}

export interface HistoriqueExport {
  id: string;
  date_creation: string;
  utilisateur: string;
  portee: PorteeExport;
  filtres: FiltresExport;
  format: FormatExport;
  nombre_lignes: number;
}
