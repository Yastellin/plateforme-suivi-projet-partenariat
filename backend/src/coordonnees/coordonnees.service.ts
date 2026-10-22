import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TypeCoordonnee } from '../common/enums/type-coordonnee.enum';
import { Coordonnee } from './entities/coordonnee.entity';

export interface ValeursCoordonnees {
  email?: string | null;
  emails?: string[] | null;
  telephone?: string | null;
  telephones?: string[] | null;
}

type Proprietaire =
  | { partenaire_id: string; contact_id?: never }
  | { contact_id: string; partenaire_id?: never };

interface ValeurPreparee {
  type: TypeCoordonnee;
  valeur: string;
  valeur_normalisee: string;
}

@Injectable()
export class CoordonneesService {
  constructor(
    @InjectRepository(Coordonnee)
    private readonly repo: Repository<Coordonnee>,
  ) {}

  /**
   * Un numéro local malgache (03x...) et sa forme internationale (+2613x...)
   * désignent la même coordonnée. Les autres indicatifs sont conservés.
   */
  normaliserTelephone(valeur: string): string {
    let telephone = valeur
      .trim()
      .replace(/^00/, '+')
      .replace(/(?!^)\D/g, '');
    if (/^0\d{9}$/.test(telephone)) telephone = `+261${telephone.slice(1)}`;
    else if (/^261\d+$/.test(telephone)) telephone = `+${telephone}`;
    return telephone;
  }

  normaliserEmail(valeur: string): string {
    return valeur.trim().toLocaleLowerCase('fr');
  }

  preparer(valeurs: ValeursCoordonnees): ValeurPreparee[] {
    const emails = this.uniques(
      [...(valeurs.email ? [valeurs.email] : []), ...(valeurs.emails ?? [])],
      (valeur) => this.normaliserEmail(valeur),
    );
    const telephones = this.uniques(
      [
        ...(valeurs.telephone ? [valeurs.telephone] : []),
        ...(valeurs.telephones ?? []),
      ],
      (valeur) => this.normaliserTelephone(valeur),
    );

    return [
      ...emails.map(({ valeur, normalisee }) => ({
        type: TypeCoordonnee.EMAIL,
        valeur,
        valeur_normalisee: normalisee,
      })),
      ...telephones.map(({ valeur, normalisee }) => ({
        type: TypeCoordonnee.TELEPHONE,
        valeur,
        valeur_normalisee: normalisee,
      })),
    ];
  }

  async synchroniserPartenaire(
    partenaireId: string,
    valeurs: ValeursCoordonnees,
    manager?: EntityManager,
  ): Promise<void> {
    await this.synchroniser({ partenaire_id: partenaireId }, valeurs, manager);
  }

  async synchroniserContact(
    contactId: string,
    valeurs: ValeursCoordonnees,
    manager?: EntityManager,
  ): Promise<void> {
    await this.synchroniser({ contact_id: contactId }, valeurs, manager);
  }

  async rechercher(email?: string, telephone?: string) {
    const recherches: { type: TypeCoordonnee; valeur_normalisee: string }[] =
      [];
    if (email?.trim()) {
      recherches.push({
        type: TypeCoordonnee.EMAIL,
        valeur_normalisee: this.normaliserEmail(email),
      });
    }
    if (telephone?.trim()) {
      recherches.push({
        type: TypeCoordonnee.TELEPHONE,
        valeur_normalisee: this.normaliserTelephone(telephone),
      });
    }
    if (!recherches.length) return [];

    const resultats = await this.repo.find({
      where: recherches,
      relations: { partenaire: true, contact: true },
    });
    // Ne jamais retourner la coordonnée d'un autre propriétaire. Le frontend
    // a seulement besoin de savoir qu'elle est déjà attribuée.
    return resultats.map((item) => ({
      id: item.id,
      type: item.type,
      proprietaire_type: item.partenaire_id ? 'PARTENAIRE' : 'CONTACT',
      proprietaire_id: item.partenaire_id ?? item.contact_id,
      proprietaire_nom:
        item.partenaire?.nom ?? item.contact?.nom ?? 'Propriétaire existant',
    }));
  }

  async valeursPartenaire(partenaireId: string) {
    return this.valeurs({ partenaire_id: partenaireId });
  }

  async valeursContact(contactId: string) {
    return this.valeurs({ contact_id: contactId });
  }

  private async synchroniser(
    proprietaire: Proprietaire,
    valeurs: ValeursCoordonnees,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager?.getRepository(Coordonnee) ?? this.repo;
    const preparees = this.preparer(valeurs);
    const normalisees = preparees.map((item) => item.valeur_normalisee);

    if (normalisees.length) {
      const requete = repo
        .createQueryBuilder('coordonnee')
        .where('coordonnee.valeur_normalisee IN (:...normalisees)', {
          normalisees,
        });
      if ('partenaire_id' in proprietaire) {
        requete.andWhere(
          '(coordonnee.partenaire_id IS NULL OR coordonnee.partenaire_id != :proprietaireId)',
          { proprietaireId: proprietaire.partenaire_id },
        );
      } else {
        requete.andWhere(
          '(coordonnee.contact_id IS NULL OR coordonnee.contact_id != :proprietaireId)',
          { proprietaireId: proprietaire.contact_id },
        );
      }
      const conflits = await requete.getMany();
      if (conflits.length) {
        const conflit = conflits[0];
        const libelle =
          conflit.type === TypeCoordonnee.EMAIL
            ? "L'adresse e-mail"
            : 'Le numéro de téléphone';
        throw new ConflictException(
          `${libelle} « ${conflit.valeur} » appartient déjà à une autre personne ou un autre partenaire.`,
        );
      }
    }

    await repo.delete(proprietaire);
    if (!preparees.length) return;

    await repo.save(
      preparees.map((item) => repo.create({ ...item, ...proprietaire })),
    );
  }

  private async valeurs(proprietaire: Partial<Proprietaire>) {
    const lignes = await this.repo.find({ where: proprietaire });
    return {
      emails: lignes
        .filter((item) => item.type === TypeCoordonnee.EMAIL)
        .map((item) => item.valeur),
      telephones: lignes
        .filter((item) => item.type === TypeCoordonnee.TELEPHONE)
        .map((item) => item.valeur),
    };
  }

  private uniques(valeurs: string[], normaliser: (valeur: string) => string) {
    const resultat = new Map<string, string>();
    for (const brute of valeurs) {
      const valeur = brute.trim();
      if (!valeur) continue;
      const normalisee = normaliser(valeur);
      if (normalisee) resultat.set(normalisee, valeur);
    }
    return [...resultat.entries()].map(([normalisee, valeur]) => ({
      valeur,
      normalisee,
    }));
  }
}
