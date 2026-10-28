import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { STORAGE_PORT } from '../../storage/storage.port';
import type { StoragePort } from '../../storage/storage.port';
import { PhotoPublication } from '../enitities/photo-publication.entity';
import { Publication } from '../enitities/publication.entity';

const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);

  constructor(
    @InjectRepository(PhotoPublication)
    private photoRepo: Repository<PhotoPublication>,
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
    @Inject(STORAGE_PORT) private storage: StoragePort,
  ) {}

  async uploadCouverture(
    publicationId: string,
    fichier: Express.Multer.File,
  ): Promise<{ image_couverture_url: string }> {
    if (!fichier) throw new BadRequestException('Aucun fichier fourni');
    if (!MIME_AUTORISES.includes(fichier.mimetype)) {
      throw new BadRequestException(
        'Type d image non autorise (JPEG, PNG, WebP)',
      );
    }

    const publication = await this.publicationRepo.findOne({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const ancienneUrl = publication.image_couverture_url;
    const nouvelleUrl = await this.storage.enregistrer(
      fichier,
      `publications/${publicationId}`,
    );

    try {
      await this.publicationRepo.update(publicationId, {
        image_couverture_url: nouvelleUrl,
      });
    } catch (erreur) {
      await this.supprimerFichierPossede(nouvelleUrl);
      throw erreur;
    }

    if (ancienneUrl && ancienneUrl !== nouvelleUrl) {
      await this.supprimerAncienneCouverture(ancienneUrl);
    }

    return { image_couverture_url: nouvelleUrl };
  }

  async supprimerCouverture(
    publicationId: string,
  ): Promise<{ image_couverture_url: null }> {
    const publication = await this.publicationRepo.findOne({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const ancienneUrl = publication.image_couverture_url;
    if (ancienneUrl) {
      await this.publicationRepo.update(publicationId, {
        image_couverture_url: null,
      });
      await this.supprimerAncienneCouverture(ancienneUrl);
    }

    return { image_couverture_url: null };
  }

  async upload(
    publicationId: string,
    fichier: Express.Multer.File,
    dto: UploadPhotoDto,
  ): Promise<PhotoResponseDto> {
    if (!fichier) throw new BadRequestException('Aucun fichier fourni');

    if (!MIME_AUTORISES.includes(fichier.mimetype)) {
      throw new BadRequestException(
        'Type d image non autorise (JPEG, PNG, WebP)',
      );
    }

    const publication = await this.publicationRepo.findOne({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `publications/${publicationId}`,
    );

    const ordre = dto.ordre ?? (await this.prochainOrdre(publicationId));
    const photo = await this.photoRepo.save(
      this.photoRepo.create({
        url_fichier: urlFichier,
        legende: dto.legende?.trim() || null,
        ordre,
        publication_id: publicationId,
      }),
    );

    return this.mapToResponse(photo);
  }

  async findAllByPublication(
    publicationId: string,
  ): Promise<PhotoResponseDto[]> {
    const publication = await this.publicationRepo.findOne({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const photos = await this.photoRepo.find({
      where: { publication_id: publicationId },
      order: { ordre: 'ASC' },
    });
    return photos.map((photo) => this.mapToResponse(photo));
  }

  async update(id: string, dto: UpdatePhotoDto): Promise<PhotoResponseDto> {
    const photo = await this.photoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvée');

    const changements: Partial<PhotoPublication> = {};
    if (dto.legende !== undefined) {
      changements.legende = dto.legende?.trim() || null;
    }
    if (dto.ordre !== undefined) changements.ordre = dto.ordre;

    if (Object.keys(changements).length > 0) {
      await this.photoRepo.update(id, changements);
    }
    const miseAJour = await this.photoRepo.findOneByOrFail({ id });
    return this.mapToResponse(miseAJour);
  }

  async remove(id: string): Promise<{ message: string }> {
    const photo = await this.photoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvee');

    await this.storage.supprimer(photo.url_fichier);
    await this.photoRepo.delete(id);

    return { message: 'Photo supprimee' };
  }

  private async supprimerAncienneCouverture(url: string): Promise<void> {
    // Les URL de démonstration externes ne sont pas des fichiers gérés par le stockage.
    if (!url.startsWith('/uploads/')) return;
    await this.supprimerFichierPossede(url);
  }

  private async supprimerFichierPossede(url: string): Promise<void> {
    try {
      await this.storage.supprimer(url);
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      this.logger.warn(
        `Suppression du fichier de couverture impossible : ${message}`,
      );
    }
  }

  private async prochainOrdre(publicationId: string): Promise<number> {
    const resultat = await this.photoRepo
      .createQueryBuilder('photo')
      .select('COALESCE(MAX(photo.ordre), -1)', 'maximum')
      .where('photo.publication_id = :publicationId', { publicationId })
      .getRawOne<{ maximum: string | number }>();
    return Number(resultat?.maximum ?? -1) + 1;
  }

  private mapToResponse(photo: PhotoPublication): PhotoResponseDto {
    return {
      id: photo.id,
      publication_id: photo.publication_id,
      url_fichier: photo.url_fichier,
      legende: photo.legende,
      ordre: photo.ordre,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
    };
  }
}
