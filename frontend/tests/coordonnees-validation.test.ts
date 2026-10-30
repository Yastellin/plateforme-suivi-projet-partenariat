import { describe, expect, it } from 'vitest';
import { contactSchema } from '@/lib/validators/contact.schema';
import { creerSchemaPartenaire } from '@/lib/validators/partenaire.schema';

const partenaireValide = {
  nom: 'Université de Toliara',
  type: 'Université',
  pays: 'Madagascar',
  adresse: '',
  telephone: '',
  telephones: [],
  email: '',
  emails: [],
  site_web: '',
  description: '',
  visibilite: 'PRIVE' as const,
  est_strategique: false,
  etablissement_id: '',
};

describe('unicité des coordonnées dans un formulaire', () => {
  it("détecte un e-mail répété sans tenir compte de la casse", () => {
    const resultat = creerSchemaPartenaire(false).safeParse({
      ...partenaireValide,
      email: 'Soa.Rakoto@univ-fianarantsoa.mg',
      emails: ['soa.rakoto@univ-fianarantsoa.mg'],
    });

    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      expect(resultat.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['emails', 0],
            message: 'Cette adresse e-mail est déjà saisie dans ce formulaire.',
          }),
        ]),
      );
    }
  });

  it("détecte les formes locale et internationale du même numéro malgache", () => {
    const resultat = contactSchema.safeParse({
      nom: 'Rakoto Soa',
      fonction: 'Responsable des partenariats',
      email: '',
      emails: [],
      telephone: '032 12 345 67',
      telephones: ['+261 32 12 345 67'],
    });

    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      expect(resultat.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['telephones', 0],
            message: 'Ce numéro de téléphone est déjà saisi dans ce formulaire.',
          }),
        ]),
      );
    }
  });

  it('accepte plusieurs coordonnées distinctes', () => {
    expect(
      creerSchemaPartenaire(false).safeParse({
        ...partenaireValide,
        email: 'contact@univ-fianarantsoa.mg',
        emails: ['partenariats@univ-fianarantsoa.mg'],
        telephone: '032 12 345 67',
        telephones: ['034 12 345 67'],
      }).success,
    ).toBe(true);
  });
});
