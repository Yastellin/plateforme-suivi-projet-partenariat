import { validate } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { CreateUtilisateurDto } from './create-utilisateur.dto';

describe('CreateUtilisateurDto', () => {
  const dtoBase = (role: Role) =>
    Object.assign(new CreateUtilisateurDto(), {
      email: 'nouveau@univ-fianarantsoa.mg',
      mot_de_passe: 'mot-de-passe-123',
      role,
    });

  it('exige un nom pour un compte établissement', async () => {
    expect(await validate(dtoBase(Role.ETABLISSEMENT))).not.toHaveLength(0);
  });

  it('accepte le nom textuel et les comptes sans établissement', async () => {
    const compteEtablissement = Object.assign(dtoBase(Role.ETABLISSEMENT), {
      etablissement_nom: 'Nouvel établissement',
    });
    const comptePresidence = dtoBase(Role.PRESIDENCE);

    expect(await validate(compteEtablissement)).toHaveLength(0);
    expect(await validate(comptePresidence)).toHaveLength(0);
  });

  it('refuse un nom vide ou composé uniquement d’espaces', async () => {
    for (const etablissement_nom of ['', '   ']) {
      const dto = Object.assign(dtoBase(Role.ETABLISSEMENT), {
        etablissement_nom,
      });
      expect(await validate(dto)).not.toHaveLength(0);
    }
  });
});
