import { validateSync } from 'class-validator';
import { CreateConventionDto } from './create-convention.dto';

describe('CreateConventionDto', () => {
  it('renvoie un message français pour un titre trop court', () => {
    const dto = Object.assign(new CreateConventionDto(), { titre: 'ab' });
    const erreurTitre = validateSync(dto).find(
      (erreur) => erreur.property === 'titre',
    );

    expect(Object.values(erreurTitre?.constraints ?? {})).toContain(
      'Le titre doit contenir au moins 3 caractères.',
    );
  });

  it('renvoie des messages français si le titre est absent', () => {
    const erreurTitre = validateSync(new CreateConventionDto()).find(
      (erreur) => erreur.property === 'titre',
    );
    const messages = Object.values(erreurTitre?.constraints ?? {});

    expect(messages).toContain('Le titre doit être du texte.');
    expect(messages).toContain('Le titre doit contenir au moins 3 caractères.');
  });

  it('rejette une référence fournie, car elle est générée par le serveur', () => {
    const dto = Object.assign(new CreateConventionDto(), {
      titre: 'Convention test',
      reference: 'CONV-2026-0001',
    });
    const erreurs = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(erreurs.some((erreur) => erreur.property === 'reference')).toBe(
      true,
    );
  });
});
