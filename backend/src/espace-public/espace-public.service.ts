import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatutPartenaire, StatutProjet, StatutConvention, StatutPublication } from '@prisma/client';
import { PublicEtablissementQueryDto, PublicPartenaireQueryDto, PublicPublicationQueryDto } from './dto/public-query.dto';
import { ContactPublicDto } from './dto/contact-public.dto';

// Agregation renvoyee par GET /public/accueil (hero de la page d'accueil).
export interface AccueilPublic {
  statistiques: {
    partenaires_actifs: number;
    projets_en_cours: number;
    conventions_signees: number;
  };
  dernieres_publications: Array<{
    id: string;
    titre: string;
    description_publique: string | null;
    date_publication: Date | null;
  }>;
  etablissements_a_la_une: unknown[];
  partenaires_a_la_une: unknown[];
  compteurs: {
    nombre_etablissements: number;
    nombre_partenaires: number;
    nombre_pays_partenaires: number;
    nombre_projets_actifs: number;
  };
}

@Injectable()
export class EspacePublicService {
  constructor(private prisma: PrismaService) {}

  /**
   * Page d'accueil publique : statistiques synthetiques, dernieres publications,
   * etablissements et partenaires mis en avant, ainsi que les compteurs animes.
   */
  async accueil(): Promise<AccueilPublic> {
    const [
      partenairesActifs,
      projetsEnCours,
      conventionsSignees,
      nombreEtablissements,
      nombrePartenaires,
      paysPartenaires,
      nombreProjetsActifs,
      dernieresPublications,
      etablissements,
      partenaires,
    ] = await Promise.all([
      this.prisma.partenaire.count({
        where: { archive: false, statut: StatutPartenaire.ACTIF, visibilite: 'PUBLIC' },
      }),
      this.prisma.projet.count({
        where: { archive: false, statut: StatutProjet.EN_COURS },
      }),
      this.prisma.convention.count({
        where: { archive: false, statut: StatutConvention.SIGNEE },
      }),
      this.prisma.etablissement.count(),
      this.prisma.partenaire.count({ where: { archive: false, visibilite: 'PUBLIC' } }),
      this.prisma.partenaire.findMany({
        where: { archive: false, visibilite: 'PUBLIC' },
        distinct: ['pays'],
        select: { pays: true },
      }),
      this.prisma.projet.count({
        where: {
          archive: false,
          statut: { in: [StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE] },
        },
      }),
      this.prisma.publication.findMany({
        where: { statut: StatutPublication.PUBLIEE },
        orderBy: { date_publication: 'desc' },
        take: 6,
        select: {
          id: true,
          titre: true,
          description_publique: true,
          date_publication: true,
        },
      }),
      this.prisma.etablissement.findMany({
        orderBy: { nom: 'asc' },
        take: 6,
      }),
      this.prisma.partenaire.findMany({
        where: { archive: false, visibilite: 'PUBLIC' },
        orderBy: [{ est_strategique: 'desc' }, { nom: 'asc' }],
        take: 12,
      }),
    ]);

    return {
      statistiques: {
        partenaires_actifs: partenairesActifs,
        projets_en_cours: projetsEnCours,
        conventions_signees: conventionsSignees,
      },
      dernieres_publications: dernieresPublications,
      etablissements_a_la_une: etablissements,
      partenaires_a_la_une: partenaires,
      compteurs: {
        nombre_etablissements: nombreEtablissements,
        nombre_partenaires: nombrePartenaires,
        nombre_pays_partenaires: paysPartenaires.length,
        nombre_projets_actifs: nombreProjetsActifs,
      },
    };
  }
  /** Liste publique des etablissements avec recherche (nom / sigle). */
  async etablissements(query: PublicEtablissementQueryDto) {
    const { page = 1, limit = 20, recherche } = query;

    const where: any = {};
    if (recherche) {
      where.OR = [
        { nom: { contains: recherche, mode: 'insensitive' } },
        { sigle: { contains: recherche, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.etablissement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.etablissement.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Liste publique des partenaires (uniquement visibilite = PUBLIC). */
  async partenaires(query: PublicPartenaireQueryDto) {
    const { page = 1, limit = 20, recherche, pays, type } = query;

    const where: any = { archive: false, visibilite: 'PUBLIC' };
    if (recherche) where.nom = { contains: recherche, mode: 'insensitive' };
    if (pays) where.pays = { contains: pays, mode: 'insensitive' };
    if (type) where.type = { contains: type, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.partenaire.findMany({
        where,
        include: { contacts: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.partenaire.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Liste publique des publications (uniquement statut = PUBLIEE). */
  async publications(query: PublicPublicationQueryDto) {
    const { page = 1, limit = 20, recherche } = query;

    const where: any = { statut: StatutPublication.PUBLIEE };
    if (recherche) where.titre = { contains: recherche, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        include: { photos: { orderBy: { ordre: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date_publication: 'desc' },
      }),
      this.prisma.publication.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Detail public d'une publication (uniquement si publiee). */
  async publication(id: string) {
    const publication = await this.prisma.publication.findFirst({
      where: { id, statut: StatutPublication.PUBLIEE },
      include: { photos: { orderBy: { ordre: 'asc' } } },
    });
    // On masque l'existence des publications non publiees (404 generique).
    if (!publication) throw new NotFoundException('Publication non trouvee');
    return publication;
  }

  /** Enregistre un message envoye depuis le formulaire de contact public. */
  async contact(dto: ContactPublicDto) {
    const message = await this.prisma.messageContact.create({
      data: {
        nom: dto.nom,
        email: dto.email,
        telephone: dto.telephone,
        sujet: dto.sujet,
        message: dto.message,
      },
    });
    return {
      id: message.id,
      message: 'Votre message a bien ete envoye. Nous vous repondrons dans les meilleurs delais.',
    };
  }
}

