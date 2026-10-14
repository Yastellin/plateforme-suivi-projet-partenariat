import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';
import { Document } from './entities/document.entity';
import { Projet } from '../projets/entities/projet.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
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
      const projet = await this.projetRepo.findOne({
        where: { id: dto.projet_id, archive: false },
      });
      if (!projet) throw new NotFoundException('Projet non trouve');
    }

    if (dto.convention_id) {
      const conventions = await this.documentRepo.manager.query(
        'SELECT id FROM "Convention" WHERE id = $1 AND archive = false',
        [dto.convention_id],
      );
      if (conventions.length === 0) {
        throw new NotFoundException('Convention non trouvee');
      }
    }

    // Archiver l'ancienne version du meme type pour la meme entite (RG24)
    const ancienneVersion = await this.documentRepo.findOne({
      where: {
        type: dto.type,
        est_archive: false,
        projet_id: dto.projet_id || IsNull(),
        convention_id: dto.convention_id || IsNull(),
      },
      order: { version: 'DESC' },
    });

    let nouvelleVersion = 1;
    if (ancienneVersion) {
      nouvelleVersion = ancienneVersion.version + 1;
      await this.documentRepo.update(ancienneVersion.id, { est_archive: true });
    }

    // Enregistrer le fichier via le port de stockage
    const dossier = dto.projet_id
      ? `projets/${dto.projet_id}`
      : `conventions/${dto.convention_id}`;
    const urlFichier = await this.storage.enregistrer(fichier, dossier);

    const document = this.documentRepo.create({
      nom_fichier: dto.nom_fichier || fichier.originalname,
      url_fichier: urlFichier,
      type: dto.type,
      version: nouvelleVersion,
      est_archive: false,
      projet_id: dto.projet_id || null,
      convention_id: dto.convention_id || null,
    });

    return this.mapToResponse(await this.documentRepo.save(document));
  }

  async findOne(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentRepo.findOne({ where: { id } });
    if (!document) throw new NotFoundException('Document non trouve');
    return this.mapToResponse(document);
  }

  async telecharger(id: string): Promise<{ chemin: string; nom: string }> {
    const document = await this.findOne(id);
    const chemin = `${process.cwd()}${document.url_fichier}`;
    return { chemin, nom: document.nom_fichier };
  }

  /** Liste paginee, filtrable par projet, convention, type ou nom de fichier. */
  async findAll(query: QueryDocumentDto) {
    const { page = 1, limit = 20, projet_id, convention_id, type, nom } = query;

    const where: FindOptionsWhere<Document> = {};
    if (projet_id) where.projet_id = projet_id;
    if (convention_id) where.convention_id = convention_id;
    if (type) where.type = type;
    if (nom) where.nom_fichier = ILike(`%${nom}%`);

    const [data, total] = await this.documentRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: data.map((document) => this.mapToResponse(document)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findVersions(id: string): Promise<DocumentResponseDto[]> {
    const document = await this.findOne(id);

    const versions = await this.documentRepo.find({
      where: {
        type: document.type,
        projet_id: document.projet_id ?? IsNull(),
        convention_id: document.convention_id ?? IsNull(),
      },
      order: { version: 'DESC' },
    });

    return versions.map((version) => this.mapToResponse(version));
  }

  async remove(id: string): Promise<{ message: string }> {
    const document = await this.findOne(id);

    await this.storage.supprimer(document.url_fichier);

    await this.documentRepo.delete(id);

    return { message: 'Document supprime' };
  }

  private mapToResponse(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      nom_fichier: document.nom_fichier,
      url_fichier: document.url_fichier,
      type: document.type,
      version: document.version,
      est_archive: document.est_archive,
      projet_id: document.projet_id,
      convention_id: document.convention_id,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }
}
