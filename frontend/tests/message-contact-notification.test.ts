import { describe, expect, it } from 'vitest';
import { analyserMessageContact } from '@/features/notifications/lib/message-contact';

describe('analyserMessageContact', () => {
  it('lit les champs et le corps d une notification de message de contact', () => {
    const texte = [
      'Référence : MC-QZQ6FNV3',
      'Expéditeur : Raoto (presidence@univ-fianarantsoa.mg)',
      'Téléphone : +261 34 22 330 54',
      'Sujet : Demande : partenariat',
      '',
      'Bonjour,\n\nje souhaite échanger.',
    ].join('\n');

    const contenu = analyserMessageContact(texte);

    expect(contenu).not.toBeNull();
    expect(contenu?.champs.map((c) => c.libelle)).toEqual(['Référence', 'Expéditeur', 'Téléphone', 'Sujet']);
    expect(contenu?.champs[3].valeur).toBe('Demande : partenariat');
    expect(contenu?.expediteur).toEqual({ nom: 'Raoto', email: 'presidence@univ-fianarantsoa.mg' });
    expect(contenu?.corps).toBe('Bonjour,\n\nje souhaite échanger.');
  });

  it('renvoie null pour l ancien format ou un texte libre', () => {
    expect(analyserMessageContact('MC-9VP2EDYJ : Rakoto — kjlll')).toBeNull();
    expect(analyserMessageContact('Simple texte sans structure')).toBeNull();
  });
});
