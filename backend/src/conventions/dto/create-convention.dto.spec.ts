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
});
