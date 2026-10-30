import { describe, expect, it } from 'vitest';

import { libelleErreurToken } from '../src/features/auth/lib/libelles-erreur-token';
import {
  schemaChangerMotDePasse,
  versPayloadChangerMotDePasse,
} from '../src/lib/validators/compte.schema';
import {
  LONGUEUR_MAX_MOT_DE_PASSE,
  LONGUEUR_MIN_MOT_DE_PASSE,
  MOTIF_MOT_DE_PASSE,
  REGLES_MOT_DE_PASSE,
  motDePasseOublieSchema,
  reinitialiserMotDePasseSchema,
} from '../src/lib/validators/mot-de-passe.schema';

const MOT_DE_PASSE_VALIDE = 'NouveauMotDePasse1';

describe('schemaChangerMotDePasse', () => {
  const valeurs = {
    mot_de_passe_actuel: 'AncienMotDePasse1',
    nouveau_mot_de_passe: MOT_DE_PASSE_VALIDE,
    confirmation_mot_de_passe: MOT_DE_PASSE_VALIDE,
  };

  it('accepte un mot de passe conforme de 8 à 72 caractères', () => {
    expect(schemaChangerMotDePasse.safeParse(valeurs).success).toBe(true);

    for (const nouveau_mot_de_passe of [
      'Abcdefg1',
      `${'A'.repeat(70)}a1`,
    ]) {
      expect(
        schemaChangerMotDePasse.safeParse({
          ...valeurs,
          nouveau_mot_de_passe,
          confirmation_mot_de_passe: nouveau_mot_de_passe,
        }).success,
      ).toBe(true);
    }
  });

  it('refuse un mot de passe trop court, trop long ou de complexité insuffisante', () => {
    for (const nouveau_mot_de_passe of [
      'Court1',
      `${'A'.repeat(71)}a1`,
      'sansmajuscule1',
      'SANSMINUSCULE1',
      'SansChiffre',
    ]) {
      expect(
        schemaChangerMotDePasse.safeParse({
          ...valeurs,
          nouveau_mot_de_passe,
          confirmation_mot_de_passe: nouveau_mot_de_passe,
        }).success,
      ).toBe(false);
    }
  });

  it('refuse une confirmation différente et exclut la confirmation du payload', () => {
    expect(
      schemaChangerMotDePasse.safeParse({
        ...valeurs,
        confirmation_mot_de_passe: 'AutreMotDePasse2',
      }).success,
    ).toBe(false);
    expect(versPayloadChangerMotDePasse(valeurs)).toEqual({
      mot_de_passe_actuel: valeurs.mot_de_passe_actuel,
      nouveau_mot_de_passe: valeurs.nouveau_mot_de_passe,
    });
  });
});

describe('motDePasseOublieSchema', () => {
  it('accepte une adresse institutionnelle', () => {
    expect(motDePasseOublieSchema.safeParse({ email: 'presidence@univ-fianarantsoa.mg' }).success).toBe(true);
  });

  it('refuse une adresse vide ou malformee', () => {
    expect(motDePasseOublieSchema.safeParse({ email: '' }).success).toBe(false);
    expect(motDePasseOublieSchema.safeParse({ email: 'pas-un-email' }).success).toBe(false);
  });
});

describe('reinitialiserMotDePasseSchema', () => {
  it('accepte un mot de passe conforme et sa confirmation', () => {
    const resultat = reinitialiserMotDePasseSchema.safeParse({
      nouveauMotDePasse: MOT_DE_PASSE_VALIDE,
      confirmationMotDePasse: MOT_DE_PASSE_VALIDE,
    });

    expect(resultat.success).toBe(true);
  });

  it('refuse un mot de passe trop court', () => {
    const resultat = reinitialiserMotDePasseSchema.safeParse({
      nouveauMotDePasse: 'Court1',
      confirmationMotDePasse: 'Court1',
    });

    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0].message).toContain(String(LONGUEUR_MIN_MOT_DE_PASSE));
  });

  it('refuse un mot de passe trop long', () => {
    const tropLong = `${'A'.repeat(LONGUEUR_MAX_MOT_DE_PASSE)}a1`;
    const resultat = reinitialiserMotDePasseSchema.safeParse({
      nouveauMotDePasse: tropLong,
      confirmationMotDePasse: tropLong,
    });

    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0].message).toContain(String(LONGUEUR_MAX_MOT_DE_PASSE));
  });

  it('refuse un mot de passe sans majuscule, sans minuscule ou sans chiffre', () => {
    for (const motDePasse of ['sansmajuscule1', 'SANSMINUSCULE1', 'SansChiffre']) {
      const resultat = reinitialiserMotDePasseSchema.safeParse({
        nouveauMotDePasse: motDePasse,
        confirmationMotDePasse: motDePasse,
      });

      expect(resultat.success, motDePasse).toBe(false);
      expect(MOTIF_MOT_DE_PASSE.test(motDePasse)).toBe(false);
    }
  });

  it('refuse une confirmation differente', () => {
    const resultat = reinitialiserMotDePasseSchema.safeParse({
      nouveauMotDePasse: MOT_DE_PASSE_VALIDE,
      confirmationMotDePasse: 'AutreMotDePasse2',
    });

    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues.map((issue) => issue.path[0])).toContain('confirmationMotDePasse');
  });

  it('exige les deux champs', () => {
    const resultat = reinitialiserMotDePasseSchema.safeParse({
      nouveauMotDePasse: MOT_DE_PASSE_VALIDE,
      confirmationMotDePasse: '',
    });

    expect(resultat.success).toBe(false);
  });
});

describe('REGLES_MOT_DE_PASSE', () => {
  it('valide les quatre criteres lorsque le mot de passe est conforme', () => {
    for (const regle of REGLES_MOT_DE_PASSE) {
      expect(regle.verifie(MOT_DE_PASSE_VALIDE), regle.libelle).toBe(true);
    }
  });

  it('signale les criteres manquants', () => {
    const valeurs = Object.fromEntries(
      REGLES_MOT_DE_PASSE.map((regle) => [regle.cle, regle.verifie('faible')]),
    );

    expect(valeurs.longueur).toBe(false);
    expect(valeurs.majuscule).toBe(false);
    expect(valeurs.minuscule).toBe(true);
    expect(valeurs.chiffre).toBe(false);
  });
});

describe('libelleErreurToken', () => {
  it('traduit les refus connus', () => {
    expect(libelleErreurToken('Token de reinitialisation deja utilise.')).toContain('déjà servi');
    expect(libelleErreurToken('Token de reinitialisation expire.')).toContain('expiré');
    expect(libelleErreurToken('Token de reinitialisation invalide.')).toContain("n'est pas reconnu");
  });

  it('conserve un message inconnu tel quel', () => {
    expect(libelleErreurToken('Erreur interne du serveur')).toBe('Erreur interne du serveur');
  });
});
