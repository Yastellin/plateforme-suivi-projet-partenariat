import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';
import { StatutPublication } from '../common/enums/statut-publication.enum';
import { Visibilite } from '../common/enums/visibilite.enum';
import {
  AccueilPublicDto,
  PublicationRecenteDto,
} from './dto/accueil-public.dto';
import { PartenairePublicDto } from './dto/partenaire-public.dto';
import { PublicationPubliqueDto } from './dto/publication-publique.dto';

@Injectable()
export class EspacePublicService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
  ) {}

  async getAccueil(): Promise<AccueilPublicDto> {
    const [
      partenaires_actifs,
      projets_en_cours,
      conventions_signees,
      publications,
    ] = await Promise.all([
      this.partenaireRepo.count({
        where: {
          visibilite: Visibilite.PUBLIC,
          statut: StatutPartenaire.ACTIF,
          archive: false,
        },
      }),
      this.projetRepo.count({
        where: {
          archive: false,
          statut: In([StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE]),
        },
      }),
      this.conventionRepo.count({
        where: {
          archive: false,
          statut: In([StatutConvention.SIGNEE, StatutConvention.ACTIVE]),
        },
      }),
      this.publicationRepo.find({
        where: { statut: StatutPublication.PUBLIEE },
        relations: { photos: true },
        order: { date_publication: 'DESC' },
        take: 5,
      }),
    ]);

    const publications_recentes: PublicationRecenteDto[] = publications.map(
      (publication) => {
        const premierePhoto = [...(publication.photos ?? [])].sort(
          (a, b) => a.ordre - b.ordre,
        )[0];
        return {
          id: publication.id,
          titre: publication.titre,
          description_publique: publication.description_publique,
          date_publication: publication.date_publication,
          projet_id: publication.projet_id,
          photo_url: premierePhoto?.url_fichier ?? null,
        };
      },
    );

    return {
      statistiques: {
        partenaires_actifs,
        projets_en_cours,
        conventions_signees,
      },
      publications_recentes,
    };
  }

  async listerPublications(): Promise<{
    data: PublicationPubliqueDto[];
    total: number;
  }> {
    const [publications, total] = await this.publicationRepo.findAndCount({
      where: { statut: StatutPublication.PUBLIEE },
      relations: { photos: true },
      order: { date_publication: 'DESC' },
    });

    return {
      data: publications.map((publication) =>
        this.mapPublicationPublique(publication),
      ),
      total,
    };
  }

  async getPublication(id: string): Promise<PublicationPubliqueDto> {
    const publication = await this.publicationRepo.findOne({
      where: { id, statut: StatutPublication.PUBLIEE },
      relations: { photos: true },
    });
    if (!publication) {
      throw new NotFoundException('Publication introuvable.');
    }

    return this.mapPublicationPublique(publication);
  }

  async listerEtablissements(): Promise<
    Array<
      Pick<Etablissement, 'id' | 'nom' | 'sigle' | 'logo_url' | 'description'>
    >
  > {
    const etablissements = await this.etablissementRepo.find({
      order: { nom: 'ASC' },
    });

    return etablissements.map(({ id, nom, sigle, logo_url, description }) => ({
      id,
      nom,
      sigle,
      logo_url,
      description,
    }));
  }

  async listerPartenaires(): Promise<PartenairePublicDto[]> {
    const partenaires = await this.partenaireRepo.find({
      where: { visibilite: Visibilite.PUBLIC, archive: false },
      order: { nom: 'ASC' },
    });

    return partenaires.map(
      ({ id, nom, type, pays, description, logo_url, site_web }) => ({
        id,
        nom,
        type,
        pays,
        description,
        logo_url,
        site_web,
      }),
    );
  }

  private mapPublicationPublique(
    publication: Publication,
  ): PublicationPubliqueDto {
    return {
      id: publication.id,
      titre: publication.titre,
      description_publique: publication.description_publique,
      date_publication: publication.date_publication,
      resultats: publication.resultats,
      projet_id: publication.projet_id,
      photos: [...(publication.photos ?? [])]
        .sort((a, b) => a.ordre - b.ordre)
        .map(({ id, url_fichier, legende, ordre }) => ({
          id,
          url_fichier,
          legende,
          ordre,
        })),
    };
  }
}
