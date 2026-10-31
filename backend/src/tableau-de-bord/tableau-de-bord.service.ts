// src/tableau-de-bord/tableau-de-bord.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThan,
  Not,
  Repository,
} from 'typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import {
  CHARGEMENT_ETABLISSEMENT,
  etablissementDeConvention,
} from '../conventions/convention-etablissement';
import { Publication } from '../publications/enitities/publication.entity';
import {
  TableauDeBordResponseDto,
  CompteursGlobauxDto,
  ProjetsParStatutDto,
  ConventionsParStatutDto,
  RepartitionConventionsDto,
} from './dto/tableau-de-bord-response.dto';
import { ActiviteMensuellePointDto } from './dto/activite-mensuelle-response.dto';
import {
  EcheancierResponseDto,
  EcheanceConventionDto,
  ProjetEnRetardDto,
} from './dto/echeancier-response.dto';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TableauDeBordService {
  constructor(
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(PartenariatEtablissement)
    private peRepo: Repository<PartenariatEtablissement>,
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
  ) {}

  async getTableauDeBord(
    role: Role,
    etablissementId?: string | null,
  ): Promise<TableauDeBordResponseDto> {
    // La Presidence et le Decideur ont une vue globale
    // L'Etablissement a une vue filtree sur ses propres donnees
    const estGlobal = role === Role.PRESIDENCE || role === Role.DECIDEUR;
    const perimetre = estGlobal ? 'GLOBAL' : 'ETABLISSEMENT';
    const filtreEtab =
      !estGlobal && etablissementId ? etablissementId : undefined;

    const [compteurs, projets_par_statut, conventions_par_statut] =
      await Promise.all([
        this.getCompteurs(filtreEtab),
        this.getProjetsParStatut(filtreEtab),
        this.getConventionsParStatut(filtreEtab),
      ]);

    return { compteurs, projets_par_statut, conventions_par_statut, perimetre };
  }

  /**
   * Activite des 6 derniers mois : conventions signees (date_signature) et
   * projets soumis (soumis_le), par mois UTC. Meme perimetre que le reste du tableau de bord.
   */
  async getActiviteMensuelle(
    role: Role,
    etablissementId?: string | null,
  ): Promise<ActiviteMensuellePointDto[]> {
    const estGlobal = role === Role.PRESIDENCE || role === Role.DECIDEUR;
    const filtreEtab = !estGlobal && etablissementId ? etablissementId : undefined;

    const maintenant = new Date();
    const annee = maintenant.getUTCFullYear();
    const moisCourant = maintenant.getUTCMonth();
    const mois: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(annee, moisCourant - i, 1));
      mois.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    }
    const debut = new Date(Date.UTC(annee, moisCourant - 5, 1));

    const points = new Map<string, ActiviteMensuellePointDto>(
      mois.map((m) => [m, { mois: m, conventions_signees: 0, projets_soumis: 0 }]),
    );
    const cleMois = (date: Date | string) => {
      const d = new Date(date);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    };

    const requeteConventions = this.conventionRepo
      .createQueryBuilder('c')
      .select('c.date_signature', 'date')
      .where('c.archive = false')
      .andWhere('c.date_signature >= :debut', { debut });
    if (filtreEtab) {
      requeteConventions
        .innerJoin('c.projet', 'p')
        .andWhere('p.etablissement_id = :etablissementId', { etablissementId: filtreEtab });
    }

    const requeteProjets = this.projetRepo
      .createQueryBuilder('p')
      .select('p.soumis_le', 'date')
      .where('p.archive = false')
      .andWhere('p.soumis_le >= :debut', { debut });
    if (filtreEtab) {
      requeteProjets.andWhere('p.etablissement_id = :etablissementId', {
        etablissementId: filtreEtab,
      });
    }

    const [conventions, projets] = await Promise.all([
      requeteConventions.getRawMany<{ date: Date }>(),
      requeteProjets.getRawMany<{ date: Date }>(),
    ]);

    for (const ligne of conventions) {
      const point = points.get(cleMois(ligne.date));
      if (point) point.conventions_signees += 1;
    }
    for (const ligne of projets) {
      const point = points.get(cleMois(ligne.date));
      if (point) point.projets_soumis += 1;
    }

    return mois.map((m) => points.get(m)!);
  }

  private async getCompteurs(
    etablissementId?: string,
  ): Promise<CompteursGlobauxDto> {
    const filtreEtab = etablissementId
      ? { etablissement_id: etablissementId }
      : {};
    const filtreEtabProjet = etablissementId
      ? { projet: { etablissement_id: etablissementId } }
      : {};

    const [
      partenaires,
      partenaires_actifs,
      partenariats,
      cotutelles,
      projets,
      projets_en_cours,
      conventions,
      conventions_signees,
      conventions_actives,
      conventions_a_echeance,
      publications,
    ] = await Promise.all([
      this.partenaireRepo.count({
        where: { archive: false, ...filtreEtab },
      }),
      this.partenaireRepo.count({
        where: {
          archive: false,
          statut: StatutPartenaire.ACTIF,
          ...filtreEtab,
        },
      }),
      etablissementId
        ? this.partenariatRepo
            .createQueryBuilder('partenariat')
            .innerJoin('partenariat.etablissements', 'pe')
            .where('partenariat.archive = false')
            .andWhere('pe.etablissement_id = :etablissementId', {
              etablissementId,
            })
            .getCount()
        : this.partenariatRepo.count({ where: { archive: false } }),
      this.cotutelleRepo.count({
        where: { archive: false, ...filtreEtab },
      }),
      this.projetRepo.count({
        where: { archive: false, ...filtreEtab },
      }),
      this.projetRepo.count({
        where: {
          archive: false,
          statut: StatutProjet.EN_COURS,
          ...filtreEtab,
        },
      }),
      this.conventionRepo.count({
        where: { archive: false, ...filtreEtabProjet },
      }),
      this.conventionRepo.count({
        where: {
          archive: false,
          statut: In([StatutConvention.SIGNEE, StatutConvention.ACTIVE]),
          ...filtreEtabProjet,
        },
      }),
      this.conventionRepo.count({
        where: {
          archive: false,
          statut: StatutConvention.ACTIVE,
          ...filtreEtabProjet,
        },
      }),
      this.compterConventionsAEcheance(etablissementId),
      this.publicationRepo.count(),
    ]);

    const repartition_conventions =
      await this.getRepartitionConventions(etablissementId);

    return {
      partenaires,
      partenaires_actifs,
      partenariats,
      cotutelles,
      projets,
      projets_en_cours,
      conventions,
      conventions_signees,
      conventions_actives,
      conventions_a_echeance,
      publications,
      repartition_conventions,
    };
  }

  private async compterConventionsAEcheance(
    etablissementId?: string,
  ): Promise<number> {
    const maintenant = new Date();
    const dans30Jours = new Date(
      maintenant.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    return this.conventionRepo.count({
      where: {
        archive: false,
        statut: In([StatutConvention.SIGNEE, StatutConvention.ACTIVE]),
        date_fin: Between(maintenant, dans30Jours),
        ...(etablissementId
          ? { projet: { etablissement_id: etablissementId } }
          : {}),
      },
    });
  }

  private async getRepartitionConventions(
    etablissementId?: string,
  ): Promise<RepartitionConventionsDto> {
    const query = this.conventionRepo
      .createQueryBuilder('c')
      .select('c.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .where('c.archive = false');
    if (etablissementId) {
      query.andWhere(
        'c.projet_id IN (SELECT id FROM "Projet" WHERE etablissement_id = :etab)',
        { etab: etablissementId },
      );
    }
    const counts = await query.groupBy('c.statut').getRawMany<{
      statut: StatutConvention;
      count: string;
    }>();

    const result: RepartitionConventionsDto = {
      BROUILLON: 0,
      EN_ATTENTE_SIGNATURE: 0,
      SIGNEE: 0,
      ACTIVE: 0,
      SUSPENDUE: 0,
      EXPIREE: 0,
    };

    for (const c of counts) {
      result[c.statut as keyof RepartitionConventionsDto] = Number(c.count);
    }

    return result;
  }

  private async getProjetsParStatut(
    etablissementId?: string,
  ): Promise<ProjetsParStatutDto> {
    const query = this.projetRepo
      .createQueryBuilder('p')
      .select('p.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .where('p.archive = false');
    if (etablissementId) {
      query.andWhere('p.etablissement_id = :etablissementId', {
        etablissementId,
      });
    }
    const counts = await query.groupBy('p.statut').getRawMany<{
      statut: StatutProjet;
      count: string;
    }>();

    const result: ProjetsParStatutDto = {
      BROUILLON: 0,
      EN_ATTENTE: 0,
      EN_COURS: 0,
      SUSPENDU: 0,
      EXPIRE: 0,
      TERMINE: 0,
    };

    for (const c of counts) {
      result[c.statut as keyof ProjetsParStatutDto] = Number(c.count);
    }

    return result;
  }

  private async getConventionsParStatut(
    etablissementId?: string,
  ): Promise<ConventionsParStatutDto> {
    const maintenant = new Date();
    const dans30Jours = new Date(
      maintenant.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Si un etablissement est cible, on filtre les conventions liees a ses projets
    const compter = (
      statut: StatutConvention | StatutConvention[],
      dateFin?: [Date, Date],
    ) => {
      const where: FindOptionsWhere<Convention> = {
        archive: false,
        statut: Array.isArray(statut) ? In(statut) : statut,
        ...(dateFin ? { date_fin: Between(dateFin[0], dateFin[1]) } : {}),
        ...(etablissementId
          ? { projet: { etablissement_id: etablissementId } }
          : {}),
      };
      return this.conventionRepo.count({ where });
    };

    const [actives, expirees, bientot_expirees, en_attente_signature] =
      await Promise.all([
        compter([StatutConvention.ACTIVE, StatutConvention.SIGNEE]),
        compter(StatutConvention.EXPIREE),
        compter(
          [StatutConvention.SIGNEE, StatutConvention.ACTIVE],
          [maintenant, dans30Jours],
        ),
        compter(StatutConvention.EN_ATTENTE_SIGNATURE),
      ]);

    return { actives, expirees, bientot_expirees, en_attente_signature };
  }

  async getEcheancier(
    etablissementId?: string | null,
  ): Promise<EcheancierResponseDto> {
    const maintenant = new Date();
    const dans30Jours = new Date(
      maintenant.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const conventions = await this.conventionRepo.find({
      where: {
        archive: false,
        statut: In([StatutConvention.SIGNEE, StatutConvention.ACTIVE]),
        date_fin: Between(maintenant, dans30Jours),
        ...(etablissementId
          ? { projet: { etablissement_id: etablissementId } }
          : {}),
      },
      relations: CHARGEMENT_ETABLISSEMENT,
      order: { date_fin: 'ASC' },
      take: 50,
    });

    const conventions_bientot_expirees: EcheanceConventionDto[] = conventions
      .filter((c) => c.date_fin !== null)
      .map((c) => {
        const jours = Math.ceil(
          (c.date_fin!.getTime() - maintenant.getTime()) /
            (24 * 60 * 60 * 1000),
        );
        const etablissement = etablissementDeConvention(c);
        return {
          id: c.id,
          reference: c.reference,
          titre: c.titre,
          date_fin: c.date_fin!,
          jours_restants: jours,
          etablissement_nom: etablissement?.nom ?? null,
          etablissement_logo_url: etablissement?.logo_url ?? null,
        };
      });

    const projets = await this.projetRepo.find({
      where: {
        archive: false,
        statut: Not(
          In([
            StatutProjet.BROUILLON,
            StatutProjet.TERMINE,
            StatutProjet.EXPIRE,
          ]),
        ),
        date_fin_prevue: LessThan(maintenant),
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
      relations: { etablissement: true },
      order: { date_fin_prevue: 'ASC' },
      take: 50,
    });

    const projets_en_retard: ProjetEnRetardDto[] = projets.map((p) => {
      const jours = Math.ceil(
        (maintenant.getTime() - p.date_fin_prevue.getTime()) /
          (24 * 60 * 60 * 1000),
      );
      return {
        id: p.id,
        nom: p.nom,
        date_fin_prevue: p.date_fin_prevue,
        jours_de_retard: jours,
        etablissement_nom: p.etablissement?.nom ?? null,
        etablissement_logo_url: p.etablissement?.logo_url ?? null,
      };
    });

    return { conventions_bientot_expirees, projets_en_retard };
  }
}
