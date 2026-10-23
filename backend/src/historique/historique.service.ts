// backend/src/historique/historique.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { HistoriqueAction } from './entities/historique-action.entity';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { QueryHistoriqueDto } from './dto/historique-query.dto';
import { HistoriqueActionResponseDto } from './dto/historique-response.dto';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { Role } from '../common/enums/role.enum';

export interface ContexteUtilisateur {
  id: string;
  email: string;
  role: string;
}

export interface ConsultationHistorique {
  id: string;
  role: Role;
  etablissement_id?: string | null;
}

export interface EntreeHistorique {
  action: ActionHistorique;
  entite_type: string;
  entite_id?: string | null;
  entite_nom?: string | null;
  utilisateur?: ContexteUtilisateur | null;
  details?: string | null;
}

@Injectable()
export class HistoriqueService {
  constructor(
    @InjectRepository(HistoriqueAction)
    private historiqueRepo: Repository<HistoriqueAction>,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
  ) {}

  /** Enregistre une action d'audit avant de confirmer l'opération à l'appelant. */
  async enregistrer(entree: EntreeHistorique): Promise<void> {
    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        action: entree.action,
        entite_type: entree.entite_type,
        entite_id: entree.entite_id ?? null,
        entite_nom: entree.entite_nom ?? null,
        utilisateur_id: entree.utilisateur?.id ?? null,
        utilisateur_nom: entree.utilisateur?.email ?? null,
        utilisateur_role: entree.utilisateur?.role ?? null,
        details: entree.details ?? null,
      }),
    );
  }

  async lister(
    query: QueryHistoriqueDto,
    consultation?: ConsultationHistorique,
  ) {
    const {
      page = 1,
      limit = 20,
      recherche,
      action,
      entite_type,
      entite_id,
      date_debut,
      date_fin,
    } = query;

    const where: FindOptionsWhere<HistoriqueAction> = {};
    if (consultation?.role === Role.ETABLISSEMENT) {
      let utilisateursIds = [consultation.id];
      if (consultation.etablissement_id) {
        const comptes = await this.utilisateurRepo.find({
          select: { id: true },
          where: { etablissement_id: consultation.etablissement_id },
        });
        if (comptes.length > 0) {
          utilisateursIds = comptes.map((compte) => compte.id);
        }
      }
      where.utilisateur_id = In(utilisateursIds);
    }
    if (action) where.action = action;
    if (entite_type) where.entite_type = entite_type;
    if (entite_id) where.entite_id = entite_id;
    if (recherche) {
      where.entite_nom = ILike(`%${recherche}%`);
    }
    if (date_debut && date_fin) {
      const fin = new Date(date_fin);
      fin.setHours(23, 59, 59, 999);
      where.date_creation = Between(new Date(date_debut), fin);
    } else if (date_debut) {
      where.date_creation = MoreThanOrEqual(new Date(date_debut));
    } else if (date_fin) {
      const fin = new Date(date_fin);
      fin.setHours(23, 59, 59, 999);
      where.date_creation = LessThanOrEqual(fin);
    }

    const [data, total] = await this.historiqueRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { date_creation: 'DESC' },
    });

    return {
      data: data.map((action) => this.mapToResponse(action)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listerEntite(entiteType: string, entiteId: string) {
    const actions = await this.historiqueRepo.find({
      where: { entite_type: entiteType, entite_id: entiteId },
      order: { date_creation: 'DESC' },
    });
    return actions.map((action) => this.mapToResponse(action));
  }

  private mapToResponse(data: HistoriqueAction): HistoriqueActionResponseDto {
    return {
      id: data.id,
      utilisateur_id: data.utilisateur_id,
      utilisateur_nom: data.utilisateur_nom,
      utilisateur_role: data.utilisateur_role,
      action: data.action,
      entite_type: data.entite_type,
      entite_id: data.entite_id,
      entite_nom: data.entite_nom,
      details: data.details,
      date_creation: data.date_creation,
    };
  }
}
