// backend/src/historique/historique.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { HistoriqueAction } from './entities/historique-action.entity';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { QueryHistoriqueDto } from './dto/historique-query.dto';
import { HistoriqueActionResponseDto } from './dto/historique-response.dto';

export interface ContexteUtilisateur {
  id: string;
  email: string;
  role: string;
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
  ) {}

  /** Enregistre une action ; ne bloque jamais l'operation principale. */
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

  async lister(query: QueryHistoriqueDto) {
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

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (entite_type) where.entite_type = entite_type;
    if (entite_id) where.entite_id = entite_id;
    if (recherche) {
      where.entite_nom = ILike(`%${recherche}%`);
    }
    if (date_debut || date_fin) {
      where.date_creation = {};
      if (date_debut) {
        (where.date_creation as Record<string, unknown>).$gte =
          new Date(date_debut);
      }
      if (date_fin) {
        (where.date_creation as Record<string, unknown>).$lte =
          new Date(date_fin);
      }
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

  private mapToResponse(
    data: HistoriqueAction,
  ): HistoriqueActionResponseDto {
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
