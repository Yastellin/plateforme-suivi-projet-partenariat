// src/tableau-de-bord/tableau-de-bord.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TableauDeBordResponseDto,
  CompteursGlobauxDto,
  ProjetsParStatutDto,
  ConventionsParStatutDto,
  RepartitionConventionsDto,
} from './dto/tableau-de-bord-response.dto';
import {
  EcheancierResponseDto,
  EcheanceConventionDto,
  ProjetEnRetardDto,
} from './dto/echeancier-response.dto';
import { StatutProjet, StatutConvention, Role } from '@prisma/client';

@Injectable()
export class TableauDeBordService {
  constructor(private prisma: PrismaService) {}

  async getTableauDeBord(
    role: Role,
    etablissementId?: string | null,
  ): Promise<TableauDeBordResponseDto> {
    // La Presidence et le Decideur ont une vue globale
    // L'Etablissement a une vue filtree sur ses propres donnees
    const estGlobal = role === Role.PRESIDENCE || role === Role.DECIDEUR;
    const perimetre = estGlobal ? 'GLOBAL' : 'ETABLISSEMENT';
    const filtreEtab = !estGlobal && etablissementId ? etablissementId : undefined;

    const [compteurs, projets_par_statut, conventions_par_statut] = await Promise.all([
      this.getCompteurs(filtreEtab),
      this.getProjetsParStatut(filtreEtab),
      this.getConventionsParStatut(filtreEtab),
    ]);

    return { compteurs, projets_par_statut, conventions_par_statut, perimetre };
  }

  private async getCompteurs(etablissementId?: string): Promise<CompteursGlobauxDto> {
    const whereEtab: any = {};
    const whereProjet: any = { archive: false };
    if (etablissementId) {
      whereEtab.etablissement_id = etablissementId;
      whereProjet.etablissement_id = etablissementId;
    }

    const [partenaires, partenariats, cotutelles, projets, conventions, publications] =
      await Promise.all([
        this.prisma.partenaire.count({
          where: { archive: false, ...whereEtab },
        }),
        this.prisma.partenariat.count({
          where: {
            archive: false,
            ...(etablissementId
              ? { etablissements: { some: { etablissement_id: etablissementId } } }
              : {}),
          },
        }),
        this.prisma.cotutelleThese.count({
          where: { archive: false, ...whereEtab },
        }),
        this.prisma.projet.count({ where: whereProjet }),
        this.prisma.convention.count({ where: { archive: false } }),
        this.prisma.publication.count({}),
      ]);

    const repartition_conventions = await this.getRepartitionConventions(etablissementId);

    return {
      partenaires,
      partenariats,
      cotutelles,
      projets,
      conventions,
      publications,
      repartition_conventions,
    };
  }

  private async getRepartitionConventions(
    etablissementId?: string,
  ): Promise<RepartitionConventionsDto> {
    const where: any = { archive: false };
    if (etablissementId) {
      where.projet = { etablissement_id: etablissementId };
    }

    const counts = await this.prisma.convention.groupBy({
      by: ['statut'],
      where,
      _count: { _all: true },
    });

    const result: RepartitionConventionsDto = {
      BROUILLON: 0,
      EN_ATTENTE_SIGNATURE: 0,
      SIGNEE: 0,
      ACTIVE: 0,
      SUSPENDUE: 0,
      EXPIREE: 0,
    };

    for (const c of counts) {
      result[c.statut as keyof RepartitionConventionsDto] = c._count._all;
    }

    return result;
  }

  private async getProjetsParStatut(etablissementId?: string): Promise<ProjetsParStatutDto> {
    const where: any = { archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const counts = await this.prisma.projet.groupBy({
      by: ['statut'],
      where,
      _count: { _all: true },
    });

    const result: ProjetsParStatutDto = {
      BROUILLON: 0,
      EN_ATTENTE: 0,
      EN_COURS: 0,
      SUSPENDU: 0,
      EXPIRE: 0,
      TERMINE: 0,
    };

    for (const c of counts) {
      result[c.statut as keyof ProjetsParStatutDto] = c._count._all;
    }

    return result;
  }

  private async getConventionsParStatut(
    etablissementId?: string,
  ): Promise<ConventionsParStatutDto> {
    const maintenant = new Date();
    const dans30Jours = new Date(maintenant.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Si un etablissement est cible, on filtre les conventions liees a ses projets
    const filtreEtab = etablissementId
      ? { projet: { etablissement_id: etablissementId } }
      : {};

    const [actives, expirees, bientot_expirees, en_attente_signature] = await Promise.all([
      this.prisma.convention.count({
        where: {
          archive: false,
          statut: { in: [StatutConvention.ACTIVE, StatutConvention.SIGNEE] },
          ...filtreEtab,
        },
      }),
      this.prisma.convention.count({
        where: {
          archive: false,
          statut: StatutConvention.EXPIREE,
          ...filtreEtab,
        },
      }),
      this.prisma.convention.count({
        where: {
          archive: false,
          statut: { in: [StatutConvention.SIGNEE, StatutConvention.ACTIVE] },
          date_fin: { gte: maintenant, lte: dans30Jours },
          ...filtreEtab,
        },
      }),
      this.prisma.convention.count({
        where: {
          archive: false,
          statut: StatutConvention.EN_ATTENTE_SIGNATURE,
          ...filtreEtab,
        },
      }),
    ]);

    return { actives, expirees, bientot_expirees, en_attente_signature };
  }

  async getEcheancier(etablissementId?: string | null): Promise<EcheancierResponseDto> {
    const maintenant = new Date();
    const dans30Jours = new Date(maintenant.getTime() + 30 * 24 * 60 * 60 * 1000);

    const filtreEtab = etablissementId
      ? { projet: { etablissement_id: etablissementId } }
      : {};

    const conventions = await this.prisma.convention.findMany({
      where: {
        archive: false,
        statut: { in: [StatutConvention.SIGNEE, StatutConvention.ACTIVE] },
        date_fin: { gte: maintenant, lte: dans30Jours },
        ...filtreEtab,
      },
      orderBy: { date_fin: 'asc' },
      take: 50,
    });

    const conventions_bientot_expirees: EcheanceConventionDto[] = conventions
      .filter((c) => c.date_fin !== null)
      .map((c) => {
        const jours = Math.ceil(
          (c.date_fin!.getTime() - maintenant.getTime()) / (24 * 60 * 60 * 1000),
        );
        return {
          id: c.id,
          reference: c.reference,
          titre: c.titre,
          date_fin: c.date_fin!,
          jours_restants: jours,
        };
      });

    const whereProjet: any = {
      archive: false,
      statut: {
        notIn: [StatutProjet.BROUILLON, StatutProjet.TERMINE, StatutProjet.EXPIRE],
      },
      date_fin_prevue: { lt: maintenant },
    };
    if (etablissementId) whereProjet.etablissement_id = etablissementId;

    const projets = await this.prisma.projet.findMany({
      where: whereProjet,
      orderBy: { date_fin_prevue: 'asc' },
      take: 50,
    });

    const projets_en_retard: ProjetEnRetardDto[] = projets.map((p) => {
      const jours = Math.ceil(
        (maintenant.getTime() - p.date_fin_prevue.getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        id: p.id,
        nom: p.nom,
        date_fin_prevue: p.date_fin_prevue,
        jours_de_retard: jours,
      };
    });

    return { conventions_bientot_expirees, projets_en_retard };
  }
}