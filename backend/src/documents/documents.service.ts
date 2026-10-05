//documents.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PORT) private storage: StoragePort,
  ) {}

  async upload(
    fichier: Express.Multer.File,
    dto: UploadDocumentDto,
  ): Promise<DocumentResponseDto> {
    if (!fichier) throw new BadRequestException('Aucun fichier fourni');

    if (!dto.projet_id && !dto.convention_id) {
      throw new BadRequestException(
        'Un document doit etre rattache a un projet ou une convention',
      );
    }

    if (dto.projet_id) {
      const projet = await this.prisma.projet.findUnique({
        where: { id: dto.projet_id, archive: false },
      });
      if (!projet) throw new NotFoundException('Projet non trouve');
    }

    if (dto.convention_id) {
      const convention = await this.prisma.convention.findUnique({
        where: { id: dto.convention_id, archive: false },
      });
      if (!convention) throw new NotFoundException('Convention non trouvee');
    }

    // Archiver l'ancienne version du meme type pour la meme entite (RG24)
    const ancienneVersion = await this.prisma.document.findFirst({
      where: {
        type: dto.type,
        est_archive: false,
        projet_id: dto.projet_id || null,
        convention_id: dto.convention_id || null,
      },
      orderBy: { version: 'desc' },
    });

    let nouvelleVersion = 1;
    if (ancienneVersion) {
      nouvelleVersion = ancienneVersion.version + 1;
      await this.prisma.document.update({
        where: { id: ancienneVersion.id },
        data: { est_archive: true },
      });
    }

    // Enregistrer le fichier via le port de stockage
    const dossier = dto.projet_id ? `projets/${dto.projet_id}` : `conventions/${dto.convention_id}`;
    const urlFichier = await this.storage.enregistrer(fichier, dossier);

    const document = await this.prisma.document.create({
      data: {
        nom_fichier: dto.nom_fichier || fichier.originalname,
        url_fichier: urlFichier,
        type: dto.type,
        version: nouvelleVersion,
        est_archive: false,
        projet_id: dto.projet_id || null,
        convention_id: dto.convention_id || null,
      },
    });

    // TODO: retirer le cast lors de la migration vers TypeORM
    return document as any;
  }

  async findOne(id: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document non trouve');
    // TODO: retirer le cast lors de la migration vers TypeORM
    return document as any;
  }

  async telecharger(id: string): Promise<{ chemin: string; nom: string }> {
    const document = await this.findOne(id);
    const chemin = `${process.cwd()}${document.url_fichier}`;
    return { chemin, nom: document.nom_fichier };
  }

  async findVersions(id: string): Promise<DocumentResponseDto[]> {
    const document = await this.findOne(id);

    const versions = await this.prisma.document.findMany({
      where: {
        type: document.type,
        projet_id: document.projet_id,
        convention_id: document.convention_id,
      },
      orderBy: { version: 'desc' },
    });

    // TODO: retirer le cast lors de la migration vers TypeORM
    return versions as any;
  }

  async remove(id: string): Promise<{ message: string }> {
    const document = await this.findOne(id);

    await this.storage.supprimer(document.url_fichier);

    await this.prisma.document.delete({ where: { id } });

    return { message: 'Document supprime' };
  }
}