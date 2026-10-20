import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Etablissement } from './entities/etablissement.entity';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';

@Injectable()
export class EtablissementsService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @Inject(STORAGE_PORT) private storage: StoragePort,
    private historique: HistoriqueService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    recherche?: string,
  ): Promise<{
    data: Etablissement[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where = recherche
      ? [{ nom: ILike(`%${recherche}%`) }, { sigle: ILike(`%${recherche}%`) }]
      : {};

    const [data, total] = await this.etablissementRepo.findAndCount({
      where,
      order: { nom: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Etablissement> {
    const etablissement = await this.etablissementRepo.findOne({
      where: { id },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement non trouvé');
    }
    return etablissement;
  }

  /** Televersement du logo d un etablissement (Presidence). */
  async televerserLogo(
    id: string,
    fichier: Express.Multer.File,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<Etablissement> {
    if (!fichier) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const MIME_AUTORISES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!MIME_AUTORISES.includes(fichier.mimetype)) {
      throw new BadRequestException(
        'Format de logo non autorise (JPEG, PNG, WebP, SVG)',
      );
    }

    const etablissement = await this.findOne(id);
    const ancienLogo = etablissement.logo_url;

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `logos/etablissements/${id}`,
    );

    await this.etablissementRepo.update(id, { logo_url: urlFichier });

    if (ancienLogo) {
      await this.storage.supprimer(ancienLogo).catch(() => undefined);
    }

    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Etablissement',
      entite_id: id,
      entite_nom: etablissement.nom,
      utilisateur: utilisateur ?? null,
      details: 'Mise a jour du logo',
    });

    return this.findOne(id);
  }
}
