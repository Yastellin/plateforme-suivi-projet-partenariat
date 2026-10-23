import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
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
  constructor(
    @InjectRepository(PhotoPublication)
    private photoRepo: Repository<PhotoPublication>,
    @InjectRepository(Publication)
    private publicationRepo: Repository<Publication>,
    @Inject(STORAGE_PORT) private storage: StoragePort,
  ) {}

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
