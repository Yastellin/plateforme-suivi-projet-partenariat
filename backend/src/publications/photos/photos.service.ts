import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadPhotoDto } from './dto/upload-photo.dto';
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
      throw new BadRequestException('Type d image non autorise (JPEG, PNG, WebP)');
    }

    const publication = await this.publicationRepo.findOne({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `publications/${publicationId}`,
    );

    const photo = await this.photoRepo.save(
      this.photoRepo.create({
        url_fichier: urlFichier,
        legende: dto.legende ?? null,
        ordre: dto.ordre ?? 0,
        publication_id: publicationId,
      }),
    );

    return this.mapToResponse(photo);
  }

  async findAllByPublication(publicationId: string): Promise<PhotoResponseDto[]> {
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

  async remove(id: string): Promise<{ message: string }> {
    const photo = await this.photoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvee');

    await this.storage.supprimer(photo.url_fichier);
    await this.photoRepo.delete(id);

    return { message: 'Photo supprimee' };
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