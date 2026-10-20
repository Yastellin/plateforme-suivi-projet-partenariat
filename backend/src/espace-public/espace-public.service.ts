import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Not, Repository } from 'typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';
import { StatutPublication } from '../common/enums/statut-publication.enum';
import { Visibilite } from '../common/enums/visibilite.enum';
import { AccueilPublicDto } from './dto/accueil-public.dto';
import { EtablissementPublicDto } from './dto/etablissement-public.dto';
import { PartenairePublicDto } from './dto/partenaire-public.dto';
import { PartenariatPublicDto } from './dto/partenariat-public.dto';
import { ProjetPublicDto } from './dto/projet-public.dto';
import { PublicationPubliqueDto } from './dto/publication-publique.dto';
import {
  PublicEtablissementQueryDto,
  PublicPartenaireQueryDto,
  PublicProjetQueryDto,
  PublicPublicationQueryDto,
} from './dto/public-query.dto';

// Statuts de projet visibles publiquement : brouillons et projets expirés exclus.
const STATUTS_PROJET_VISIBLES = [
  StatutProjet.EN_ATTENTE,
  StatutProjet.EN_COURS,
  StatutProjet.SUSPENDU,
  StatutProjet.TERMINE,
];

export interface PageServeurPublique<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// Regles de visibilite publique, appliquees a toutes les requetes de l'espace public.
const PARTENAIRE_VISIBLE: FindOptionsWhere<Partenaire> = {
  visibilite: Visibilite.PUBLIC,
  statut: StatutPartenaire.ACTIF,
  archive: false,
};

const PUBLICATION_VISIBLE: FindOptionsWhere<Publication> = {
  statut: StatutPublication.PUBLIEE,
  projet: { archive: false },
};

const PROJET_VISIBLE: FindOptionsWhere<Projet> = {
  archive: false,
  statut: In(STATUTS_PROJET_VISIBLES),
};

@Injectable()
export class EspacePublicService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
  ) {}

  async getAccueil(): Promise<AccueilPublicDto> {
    const [
      nombre_etablissements,
      partenaires,
      nombre_projets_actifs,
      nombre_publications,
      nombre_conventions_actives,
      publications,
      projets,
      partenaires_a_la_une,
      etablissements,
    ] = await Promise.all([
      this.etablissementRepo.count(),
      this.partenaireRepo.find({
        where: PARTENAIRE_VISIBLE,
        select: { id: true, pays: true },
      }),
      this.projetRepo.count({
        where: {
          archive: false,
          statut: In([StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE]),
        },
      }),
      this.publicationRepo.count({ where: PUBLICATION_VISIBLE }),
      this.conventionRepo.count({
        where: {
          archive: false,
          statut: In([StatutConvention.SIGNEE, StatutConvention.ACTIVE]),
        },
      }),
      this.publicationRepo.find({
        where: PUBLICATION_VISIBLE,
        relations: { photos: true, projet: { etablissement: true } },
        order: { date_publication: 'DESC' },
        take: 6,
      }),
      this.projetRepo.find({
        where: PROJET_VISIBLE,
        relations: this.relationsProjet(),
        order: { created_at: 'DESC' },
        take: 6,
      }),
      this.partenaireRepo.find({
        where: PARTENAIRE_VISIBLE,
        order: { est_strategique: 'DESC', nom: 'ASC' },
        take: 12,
      }),
      this.etablissementRepo.find({ order: { nom: 'ASC' }, take: 12 }),
    ]);

    return {
      compteurs: {
        nombre_etablissements,
        nombre_partenaires: partenaires.length,
        nombre_pays_partenaires: new Set(
          partenaires.map((p) => p.pays.trim().toLowerCase()).filter(Boolean),
        ).size,
        nombre_projets_actifs,
        nombre_publications,
        nombre_conventions_actives,
      },
      dernieres_publications: publications.map((p) => this.versPublication(p)),
      projets_a_la_une: projets.map((p) => this.versProjet(p)),
      partenaires_a_la_une: partenaires_a_la_une.map((p) =>
        this.versPartenaire(p),
      ),
      etablissements_a_la_une: etablissements.map((e) =>
        this.versEtablissement(e),
      ),
    };
  }

  async listerPublications(
    query: PublicPublicationQueryDto,
  ): Promise<PageServeurPublique<PublicationPubliqueDto>> {
    const { page, limit } = this.pagination(query);
    const recherche = query.recherche?.trim();
    const where: FindOptionsWhere<Publication>[] = recherche
      ? [{ ...PUBLICATION_VISIBLE, titre: ILike(`%${recherche}%`) }]
      : [PUBLICATION_VISIBLE];

    const [publications, total] = await this.publicationRepo.findAndCount({
      where,
      relations: { photos: true, projet: { etablissement: true } },
      order: { date_publication: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.paginer(
      publications.map((p) => this.versPublication(p)),
      page,
      limit,
      total,
    );
  }

  async getPublication(id: string): Promise<PublicationPubliqueDto> {
    const publication = await this.publicationRepo.findOne({
      where: { id, ...PUBLICATION_VISIBLE },
      relations: { photos: true, projet: { etablissement: true } },
    });
    if (!publication) {
      throw new NotFoundException('Publication introuvable.');
    }
    return this.versPublication(publication);
  }

  async listerProjets(
    query: PublicProjetQueryDto,
  ): Promise<PageServeurPublique<ProjetPublicDto>> {
    const { page, limit } = this.pagination(query);
    const recherche = query.recherche?.trim();
    const base: FindOptionsWhere<Projet> = {
      ...PROJET_VISIBLE,
      ...(query.etablissement_id
        ? { etablissement_id: query.etablissement_id }
        : {}),
    };
    const where: FindOptionsWhere<Projet>[] = recherche
      ? [
          { ...base, nom: ILike(`%${recherche}%`) },
          { ...base, intitule_officiel: ILike(`%${recherche}%`) },
        ]
      : [base];

    const [projets, total] = await this.projetRepo.findAndCount({
      where,
      relations: this.relationsProjet(),
      order: { nom: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.paginer(
      projets.map((p) => this.versProjet(p)),
      page,
      limit,
      total,
    );
  }

  async listerEtablissements(
    query: PublicEtablissementQueryDto,
  ): Promise<PageServeurPublique<EtablissementPublicDto>> {
    const { page, limit } = this.pagination(query);
    const recherche = query.recherche?.trim();
    const where: FindOptionsWhere<Etablissement>[] = recherche
      ? [{ nom: ILike(`%${recherche}%`) }, { sigle: ILike(`%${recherche}%`) }]
      : [{}];

    const [etablissements, total] = await this.etablissementRepo.findAndCount({
      where,
      order: { nom: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.paginer(
      etablissements.map((e) => this.versEtablissement(e)),
      page,
      limit,
      total,
    );
  }

  async listerPartenaires(
    query: PublicPartenaireQueryDto,
  ): Promise<PageServeurPublique<PartenairePublicDto>> {
    const { page, limit } = this.pagination(query);
    const recherche = query.recherche?.trim();
    const base: FindOptionsWhere<Partenaire> = {
      ...PARTENAIRE_VISIBLE,
      ...(query.pays ? { pays: ILike(query.pays.trim()) } : {}),
      ...(query.type ? { type: ILike(query.type.trim()) } : {}),
    };
    const where: FindOptionsWhere<Partenaire>[] = recherche
      ? [{ ...base, nom: ILike(`%${recherche}%`) }]
      : [base];

    const [partenaires, total] = await this.partenaireRepo.findAndCount({
      where,
      order: { est_strategique: 'DESC', nom: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.paginer(
      partenaires.map((p) => this.versPartenaire(p)),
      page,
      limit,
      total,
    );
  }

  /** Projets soumis et publies par la Presidence (etablissements inclus). */
  async listerProjetsPublies(): Promise<ProjetPublicDto[]> {
    const projets = await this.projetRepo.find({
      where: {
        archive: false,
        publie_le: Not(null) as unknown as never,
      },
      relations: this.relationsProjet(),
      order: { publie_le: 'DESC' },
    });

    return projets.map((projet) => this.versProjet(projet));
  }

  /** Partenariats soumis et publies par la Presidence (etablissements inclus). */
  async listerPartenariatsPublies(): Promise<PartenariatPublicDto[]> {
    const partenariats = await this.partenariatRepo.find({
      where: {
        archive: false,
        publie_le: Not(null) as unknown as never,
      },
      relations: {
        etablissements: { etablissement: true },
      },
      order: { publie_le: 'DESC' },
    });

    return partenariats.map((partenariat) => ({
      id: partenariat.id,
      intitule: partenariat.intitule,
      objet: partenariat.objet,
      domaine: partenariat.domaine,
      date_debut: partenariat.date_debut,
      date_fin: partenariat.date_fin,
      etablissements: (partenariat.etablissements ?? []).map((lien) => ({
        id: lien.etablissement.id,
        nom: lien.etablissement.nom,
        sigle: lien.etablissement.sigle,
      })),
    }));
  }

  private relationsProjet() {
    return {
      etablissement: true,
      publication: true,
      partenaires: { partenaire: true },
    } as const;
  }

  private pagination(query: { page?: number; limit?: number }) {
    return { page: query.page ?? 1, limit: query.limit ?? 20 };
  }

  private paginer<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PageServeurPublique<T> {
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private versPartenaire(p: Partenaire): PartenairePublicDto {
    return {
      id: p.id,
      nom: p.nom,
      type: p.type,
      pays: p.pays,
      description: p.description,
      logo_url: p.logo_url,
      site_web: p.site_web,
      est_strategique: p.est_strategique,
    };
  }

  private versEtablissement(e: Etablissement): EtablissementPublicDto {
    return {
      id: e.id,
      nom: e.nom,
      sigle: e.sigle,
      logo_url: e.logo_url,
      description: e.description,
    };
  }

  private versProjet(projet: Projet): ProjetPublicDto {
    const publication =
      projet.publication?.statut === StatutPublication.PUBLIEE
        ? projet.publication
        : null;
    return {
      id: projet.id,
      nom: projet.nom,
      intitule_officiel: projet.intitule_officiel,
      type: projet.type,
      domaine: projet.domaine,
      statut: projet.statut,
      date_debut: projet.date_debut,
      date_fin_prevue: projet.date_fin_prevue,
      description: publication?.description_publique ?? null,
      publication_id: publication?.id ?? null,
      // L'etablissement est facultatif (projet porte par la Presidence seule) :
      // un projet peut ne plus avoir d'etablissement rattaché (nullable), le
      // champ est alors absent de la fiche publique.
      etablissement: projet.etablissement
        ? {
            id: projet.etablissement.id,
            nom: projet.etablissement.nom,
            sigle: projet.etablissement.sigle,
          }
        : null,
      etablissement_nom: projet.etablissement?.nom ?? null,
      etablissement_sigle: projet.etablissement?.sigle ?? null,
      // Seuls les partenaires publics et actifs sont exposés.
      partenaires: (projet.partenaires ?? [])
        .map((pp) => pp.partenaire)
        .filter(
          (p): p is Partenaire =>
            !!p &&
            p.visibilite === Visibilite.PUBLIC &&
            p.statut === StatutPartenaire.ACTIF &&
            !p.archive,
        )
        .map((p) => this.versPartenaire(p)),
    };
  }

  private versPublication(p: Publication): PublicationPubliqueDto {
    const photos = [...(p.photos ?? [])].sort((a, b) => a.ordre - b.ordre);
    return {
      id: p.id,
      titre: p.titre,
      description_publique: p.description_publique,
      date_publication: p.date_publication,
      resultats: p.resultats,
      projet_id: p.projet_id,
      projet: {
        id: p.projet.id,
        nom: p.projet.nom,
        intitule_officiel: p.projet.intitule_officiel,
        etablissement: p.projet.etablissement
          ? {
              id: p.projet.etablissement.id,
              nom: p.projet.etablissement.nom,
              sigle: p.projet.etablissement.sigle,
            }
          : null,
      },
      photo_url: photos[0]?.url_fichier ?? null,
      photos: photos.map(({ id, url_fichier, legende, ordre }) => ({
        id,
        url_fichier,
        legende,
        ordre,
      })),
    };
  }

  // Methode issue de la branche arena : meme mapping que versPublication,
  // conservee pour les consommateurs existants.
  private mapPublicationPublique(
    publication: Publication,
  ): PublicationPubliqueDto {
    return this.versPublication(publication);
  }
}
