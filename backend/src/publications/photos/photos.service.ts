import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { STORAGE_PORT } from '../../storage/storage.port';
import type { StoragePort } from '../../storage/storage.port';

const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class PhotosService {
  constructor(
    private prisma: PrismaService,
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

    const publication = await this.prisma.publication.findUnique({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    const urlFichier = await this.storage.enregistrer(
      fichier,
      `publications/${publicationId}`,
    );

    const photo = await this.prisma.photoPublication.create({
      data: {
        url_fichier: urlFichier,
        legende: dto.legende,
        ordre: dto.ordre ?? 0,
        publication_id: publicationId,
      },
    });

    return photo;
  }

  async findAllByPublication(publicationId: string): Promise<PhotoResponseDto[]> {
    const publication = await this.prisma.publication.findUnique({
      where: { id: publicationId },
    });
    if (!publication) throw new NotFoundException('Publication non trouvee');

    return this.prisma.photoPublication.findMany({
      where: { publication_id: publicationId },
      orderBy: { ordre: 'asc' },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const photo = await this.prisma.photoPublication.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvee');

    await this.storage.supprimer(photo.url_fichier);
    await this.prisma.photoPublication.delete({ where: { id } });

    return { message: 'Photo supprimee' };
  }
}