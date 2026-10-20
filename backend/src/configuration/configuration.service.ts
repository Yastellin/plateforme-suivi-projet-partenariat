// backend/src/configuration/configuration.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';

const CLE_PRESEIDENCE = 'presidence';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepo: Repository<Configuration>,
    @Inject(STORAGE_PORT) private storage: StoragePort,
    private historique: HistoriqueService,
  ) {}

  /** Retourne (et cree si besoin) la configuration de la Presidence. */
  async getConfiguration(): Promise<Configuration> {
    let configuration = await this.configurationRepo.findOne({
      where: { cle: CLE_PRESEIDENCE },
    });

    if (!configuration) {
      configuration = await this.configurationRepo.save(
        this.configurationRepo.create({ cle: CLE_PRESEIDENCE }),
      );
    }

    return configuration;
  }

  /** Televersement du logo de la Presidence. */
  async televerserLogoPresidence(
    fichier: Express.Multer.File,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<Configuration> {
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

    const configuration = await this.getConfiguration();
    const ancienLogo = configuration.logo_url;

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `logos/presidence`,
    );

    await this.configurationRepo.update(configuration.id, {
      logo_url: urlFichier,
    });

    if (ancienLogo) {
      await this.storage.supprimer(ancienLogo).catch(() => undefined);
    }

    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Configuration',
      entite_id: configuration.id,
      entite_nom: 'Presidence',
      utilisateur: utilisateur ?? null,
      details: 'Mise a jour du logo de la Presidence',
    });

    return this.getConfiguration();
  }
}
