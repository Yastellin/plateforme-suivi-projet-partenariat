import {
  calculerSimilariteNoms,
  normaliserNomPartenaire,
} from './normalisation-nom-partenaire';

describe('normalisation des noms de partenaires', () => {
  it('ignore la casse, les accents et les espaces superflus', () => {
    expect(normaliserNomPartenaire('  Université   d’Antananarivo ')).toBe(
      normaliserNomPartenaire('UNIVERSITE d’Antananarivo'),
    );
  });

  it('mesure les noms proches sans les classer comme doublons exacts', () => {
    const nomOriginal = 'Université Antananarivo';
    const nomProche = 'Universite Antananariv';
    expect(normaliserNomPartenaire(nomOriginal)).not.toBe(
      normaliserNomPartenaire(nomProche),
    );
    expect(calculerSimilariteNoms(nomOriginal, nomProche)).toBeGreaterThan(0.9);
  });
});
