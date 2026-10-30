import { validate } from 'class-validator';
import { UpdateMotDePasseDto } from './update-mot-de-passe.dto';

describe('UpdateMotDePasseDto', () => {
  const dtoValide = () =>
    Object.assign(new UpdateMotDePasseDto(), {
      mot_de_passe_actuel: 'AncienMotDePasse1',
      nouveau_mot_de_passe: 'NouveauMotDePasse1',
    });

  it('accepte un nouveau mot de passe de complexité conforme entre 8 et 72 caractères', async () => {
    expect(await validate(dtoValide())).toHaveLength(0);

    for (const nouveau_mot_de_passe of ['Abcdefg1', `${'A'.repeat(70)}a1`]) {
      const dto = Object.assign(dtoValide(), { nouveau_mot_de_passe });
      expect(await validate(dto)).toHaveLength(0);
    }
  });

  it('refuse un mot de passe actuel vide', async () => {
    const dto = Object.assign(dtoValide(), { mot_de_passe_actuel: '' });
    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('refuse une longueur hors limites et les critères de complexité manquants', async () => {
    for (const nouveau_mot_de_passe of [
      'Court1',
      `${'A'.repeat(71)}a1`,
      'sansmajuscule1',
      'SANSMINUSCULE1',
      'SansChiffre',
    ]) {
      const dto = Object.assign(dtoValide(), { nouveau_mot_de_passe });
      expect(await validate(dto)).not.toHaveLength(0);
    }
  });
});
