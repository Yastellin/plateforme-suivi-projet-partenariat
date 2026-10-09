export const MOT_DE_PASSE_MODIFIE = 'mot-de-passe-modifie';

export class MotDePasseModifieEvent {
  constructor(
    public readonly utilisateur_id: string,
    public readonly email: string,
  ) {}
}