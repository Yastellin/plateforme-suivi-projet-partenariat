import { validateSync } from 'class-validator';
import { UpdateConventionDto } from './update-convention.dto';

describe('UpdateConventionDto', () => {
  it('rejette une référence envoyée en modification', () => {
    const dto = Object.assign(new UpdateConventionDto(), {
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
