import { describe, expect, it } from 'vitest';

import { creerSchemaProjet } from '../src/lib/validators/projet.schema';
import { creerSchemaPartenariat } from '../src/lib/validators/partenariat.schema';
import { creerSchemaConvention, schemaConvention } from '../src/lib/validators/convention.schema';
import { creerSchemaCotutelle, schemaCotutelle } from '../src/lib/validators/cotutelle.schema';
import { jourCourant, jourDe } from '../src/lib/validators/regles-dates';
import { dateDans } from './outils/dates';

const AUJOURDHUI = dateDans(0);
const HIER = dateDans(-1);
const DEMAIN = dateDans(1);
const DANS_UN_AN = dateDans(365);

function cheminsEnErreur(resultat: { error?: { issues: { path: PropertyKey[] }[] } }) {
  return resultat.error?.issues.map((issue) => issue.path[0]);
}

describe('jourCourant', () => {
  it('renvoie le jour du poste au format AAAA-MM-JJ', () => {
    expect(jourCourant()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(jourCourant().slice(0, 4)).toBe(String(new Date().getFullYear()));
  });

  it('ramene une date ISO a son jour', () => {
    expect(jourDe('2026-03-04T22:30:00.000Z')).toBe('2026-03-04');
  });
});

describe('projet : regles de dates', () => {
  const creation = creerSchemaProjet({ exigerDateDebutFuture: true });
  const modification = creerSchemaProjet({ exigerDateDebutFuture: false });

  const valeurs = (date_debut: string, date_fin_prevue: string) => ({
    nom: 'Projet',
    type: 'Recherche',
    date_debut,
    date_fin_prevue,
    statut: 'BROUILLON' as const,
    // Le porteur est obligatoire depuis la regle metier de la Presidence.
    porteur: {
      mode: 'nouveau' as const,
      type_porteur: 'PERSONNE' as const,
      nom: 'Rakoto',
      institution_rattachement: '',
    },
  })

  it('refuse une date de debut anterieure a aujourd hui a la creation', () => {
    const resultat = creation.safeParse(valeurs(HIER, DANS_UN_AN));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_debut');
  });

  it('accepte la date du jour a la creation', () => {
    expect(creation.safeParse(valeurs(AUJOURDHUI, DANS_UN_AN)).success).toBe(true);
  });

  it('refuse une date de fin anterieure ou egale a la date de debut', () => {
    const resultat = creation.safeParse(valeurs(DEMAIN, DEMAIN));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_fin_prevue');
  });

  it('accepte une date de debut passee en modification', () => {
    expect(modification.safeParse(valeurs(HIER, DANS_UN_AN)).success).toBe(true);
  });

  it('exige un porteur', () => {
    const resultat = creation.safeParse({
      ...valeurs(AUJOURDHUI, DANS_UN_AN),
      porteur: undefined,
    });

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('porteur');
  });

  it('exige un porteur existant selectionne quand le mode est existant', () => {
    const resultat = creation.safeParse({
      ...valeurs(AUJOURDHUI, DANS_UN_AN),
      porteur: { mode: 'existant', porteur_id: '' },
    });

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('porteur');
  });

  it('accepte un projet sans etablissement (projet transversal)', () => {
    expect(
      creation.safeParse({
        ...valeurs(AUJOURDHUI, DANS_UN_AN),
        etablissement_id: null,
      }).success,
    ).toBe(true);
  });
});

describe('partenariat : regles de dates', () => {
  const creation = creerSchemaPartenariat(true, { exigerDateDebutFuture: true });

  const valeurs = (date_debut: string, date_fin?: string) => ({
    intitule: 'Partenariat',
    domaine: 'RECHERCHE' as const,
    date_debut,
    date_fin,
    partenaires_ids: ['partenaire-1'],
    etablissements_ids: ['etablissement-1'],
  });

  it('refuse une date de debut anterieure a aujourd hui a la creation', () => {
    const resultat = creation.safeParse(valeurs(HIER));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_debut');
  });

  it('refuse une date de fin anterieure a la date de debut', () => {
    const resultat = creation.safeParse(valeurs(DANS_UN_AN, DEMAIN));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_fin');
  });

  it('accepte des dates coherentes', () => {
    expect(creation.safeParse(valeurs(AUJOURDHUI, DANS_UN_AN)).success).toBe(true);
  });
});

describe('convention : regles de dates', () => {
  const creation = creerSchemaConvention({ exigerDateDebutFuture: true });

  const valeurs = (dates: { date_debut?: string; date_fin?: string }) => ({
    reference: 'C-1',
    titre: 'Convention',
    statut: 'BROUILLON' as const,
    description: '',
    date_signature: '',
    partenariat_id: '',
    projet_id: '',
    ...dates,
  });

  it('refuse une date de debut anterieure a aujourd hui a l ajout', () => {
    const resultat = creation.safeParse(valeurs({ date_debut: HIER, date_fin: DANS_UN_AN }));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_debut');
  });

  it('accepte la date du jour a l ajout', () => {
    expect(creation.safeParse(valeurs({ date_debut: AUJOURDHUI, date_fin: DANS_UN_AN })).success).toBe(true);
  });

  it('refuse une date de fin anterieure ou egale a la date de debut', () => {
    const resultat = creation.safeParse(valeurs({ date_debut: DANS_UN_AN, date_fin: DANS_UN_AN }));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_fin');
  });

  it('laisse les dates libres quand elles ne sont pas renseignees', () => {
    expect(creation.safeParse(valeurs({})).success).toBe(true);
  });

  it('n applique pas la regle d ajout au schema de modification', () => {
    expect(schemaConvention.safeParse(valeurs({ date_debut: HIER, date_fin: DANS_UN_AN })).success).toBe(true);
  });

  it('exige une reference et un titre', () => {
    expect(schemaConvention.safeParse({ reference: '', titre: 'C', statut: 'BROUILLON' }).success).toBe(false);
  });

  it('accepte les champs optionnels vides avant normalisation', () => {
    expect(
      schemaConvention.safeParse({
        reference: 'C-1',
        titre: 'Convention',
        statut: 'BROUILLON',
        description: '',
        date_signature: '',
        date_debut: '',
        date_fin: '',
        partenariat_id: '',
        projet_id: '',
      }).success,
    ).toBe(true);
  });
});

describe('cotutelle : regles de dates', () => {
  const creation = creerSchemaCotutelle({ exigerDateDebutFuture: true });

  const valeurs = (dates: { date_debut?: string; date_prevue_soutenance?: string }) => ({
    nom_doctorant: 'Rakoto Andry',
    type: 'COTUTELLE' as const,
    etablissement_id: 'etablissement-1',
    partenaire_id: 'partenaire-1',
    ...dates,
  });

  it('refuse une date de debut anterieure a aujourd hui a l ajout', () => {
    const resultat = creation.safeParse(valeurs({ date_debut: HIER, date_prevue_soutenance: DANS_UN_AN }));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_debut');
  });

  it('accepte la date du jour a l ajout', () => {
    expect(creation.safeParse(valeurs({ date_debut: AUJOURDHUI })).success).toBe(true);
  });

  it('refuse une date de soutenance anterieure ou egale a la date de debut', () => {
    const resultat = creation.safeParse(valeurs({ date_debut: DANS_UN_AN, date_prevue_soutenance: DEMAIN }));

    expect(resultat.success).toBe(false);
    expect(cheminsEnErreur(resultat)).toContain('date_prevue_soutenance');
  });

  it('accepte une date de debut passee en modification', () => {
    expect(schemaCotutelle.safeParse(valeurs({ date_debut: HIER })).success).toBe(true);
  });
});
