// backend/src/documents/documents.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { basename, extname } from 'path';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';
import { Document } from './entities/document.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';

type ParentDocument = {
  cle: 'projet_id' | 'convention_id' | 'cotutelle_id' | 'partenariat_id';
  valeur: string;
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @Inject(STORAGE_PORT) private storage: StoragePort,
    private historique: HistoriqueService,
  ) {}

  async upload(
    fichier: Express.Multer.File,
    dto: UploadDocumentDto,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<DocumentResponseDto> {
    if (!fichier) throw new BadRequestException('Aucun fichier fourni');

    const parent = this.extraireParent(dto);
    if (!parent) {
      throw new BadRequestException(
        'Un document doit etre rattache a un projet, une convention, une cotutelle ou un partenariat',
      );
    }

    await this.verifierParent(parent);

    const nomFichier = this.nettoyerNomFichier(
      dto.nom_fichier || fichier.originalname,
    );
    const rattachement = {
      type: dto.type,
      nom_fichier: nomFichier,
      projet_id: parent.cle === 'projet_id' ? parent.valeur : IsNull(),
      convention_id: parent.cle === 'convention_id' ? parent.valeur : IsNull(),
      cotutelle_id: parent.cle === 'cotutelle_id' ? parent.valeur : IsNull(),
      partenariat_id:
        parent.cle === 'partenariat_id' ? parent.valeur : IsNull(),
    };

    // Les documents d'un même type sont indépendants lorsque leur nom diffère.
    // Un nouveau fichier portant le même nom crée une nouvelle version.
    const [derniereVersion, ancienneVersionActive] = await Promise.all([
      this.documentRepo.findOne({
        where: rattachement,
        order: { version: 'DESC' },
      }),
      this.documentRepo.findOne({
        where: { ...rattachement, est_archive: false },
      }),
    ]);
    const nouvelleVersion = (derniereVersion?.version ?? 0) + 1;

    if (ancienneVersionActive) {
      await this.documentRepo.update(ancienneVersionActive.id, {
        est_archive: true,
      });
      await this.historique.enregistrer({
        action: ActionHistorique.ARCHIVAGE,
        entite_type: 'Document',
        entite_id: ancienneVersionActive.id,
        entite_nom: ancienneVersionActive.nom_fichier,
        utilisateur: utilisateur ?? null,
        details: `Remplacé par la version ${nouvelleVersion}`,
      });
    }

    const dossier = `${parent.cle.replace('_id', '')}s/${parent.valeur}`;
    const urlFichier = await this.storage.enregistrer(fichier, dossier);

    const document = this.documentRepo.create({
      nom_fichier: nomFichier,
      url_fichier: urlFichier,
      type: dto.type,
      version: nouvelleVersion,
      est_archive: false,
      projet_id: parent.cle === 'projet_id' ? parent.valeur : null,
      convention_id: parent.cle === 'convention_id' ? parent.valeur : null,
      cotutelle_id: parent.cle === 'cotutelle_id' ? parent.valeur : null,
      partenariat_id: parent.cle === 'partenariat_id' ? parent.valeur : null,
    });

    const enregistre = await this.documentRepo.save(document);
    await this.historique.enregistrer({
      action: ActionHistorique.CREATION,
      entite_type: 'Document',
      entite_id: enregistre.id,
      entite_nom: enregistre.nom_fichier,
      utilisateur: utilisateur ?? null,
      details: `Version ${enregistre.version}`,
    });
    return this.mapToResponse(enregistre);
  }

  async findOne(
    id: string,
    inclureArchives = false,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentRepo.findOne({
      where: {
        id,
        ...(inclureArchives ? {} : { est_archive: false }),
      },
    });
    if (!document) throw new NotFoundException('Document non trouve');
    return this.mapToResponse(document);
  }

  async telecharger(
    id: string,
    inclureArchives = false,
  ): Promise<{ chemin: string; nom: string }> {
    const document = await this.findOne(id, inclureArchives);
    const chemin = `${process.cwd()}${document.url_fichier}`;
    return { chemin, nom: document.nom_fichier };
  }

  /** Liste paginee, filtrable par parent, type ou nom de fichier. */
  async findAll(query: QueryDocumentDto) {
    const {
      page = 1,
      limit = 20,
      projet_id,
      convention_id,
      cotutelle_id,
      partenariat_id,
      type,
      nom,
    } = query;

    // La liste courante ne mélange pas les archives et les versions remplacées ;
    // celles-ci restent accessibles par l'historique et le module Archives.
    const where: FindOptionsWhere<Document> = { est_archive: false };
    if (projet_id) where.projet_id = projet_id;
    if (convention_id) where.convention_id = convention_id;
    if (cotutelle_id) where.cotutelle_id = cotutelle_id;
    if (partenariat_id) where.partenariat_id = partenariat_id;
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
        nom_fichier: document.nom_fichier,
        projet_id: document.projet_id ?? IsNull(),
        convention_id: document.convention_id ?? IsNull(),
        cotutelle_id: document.cotutelle_id ?? IsNull(),
        partenariat_id: document.partenariat_id ?? IsNull(),
      },
      order: { version: 'DESC' },
    });

    return versions.map((version) => this.mapToResponse(version));
  }

  async remove(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<{ message: string }> {
    const document = await this.findOne(id);
    if (document.est_archive) {
      throw new BadRequestException('Ce document est déjà archivé');
    }

    // L'archivage logique conserve le fichier, son nom et toutes ses versions.
    await this.documentRepo.update(id, { est_archive: true });
    await this.historique.enregistrer({
      action: ActionHistorique.ARCHIVAGE,
      entite_type: 'Document',
      entite_id: id,
      entite_nom: document.nom_fichier,
      utilisateur: utilisateur ?? null,
    });

    return { message: 'Document archive' };
  }

  private extraireParent(dto: UploadDocumentDto): ParentDocument | null {
    const candidats: ParentDocument[] = [
      { cle: 'projet_id' as const, valeur: dto.projet_id ?? '' },
      { cle: 'convention_id' as const, valeur: dto.convention_id ?? '' },
      { cle: 'cotutelle_id' as const, valeur: dto.cotutelle_id ?? '' },
      { cle: 'partenariat_id' as const, valeur: dto.partenariat_id ?? '' },
    ].filter((candidat) => Boolean(candidat.valeur));

    if (candidats.length === 0) return null;
    if (candidats.length > 1) {
      throw new BadRequestException(
        'Un document ne peut etre rattache qu a une seule entite a la fois',
      );
    }
    return candidats[0];
  }

  private async verifierParent(parent: ParentDocument): Promise<void> {
    let existant: unknown;
    let intituleManquant = 'Entite liee non trouvee';

    switch (parent.cle) {
      case 'projet_id':
        existant = await this.projetRepo.findOne({
          where: { id: parent.valeur, archive: false },
        });
        intituleManquant = 'Projet non trouve';
        break;
      case 'convention_id':
        existant = await this.conventionRepo.findOne({
          where: { id: parent.valeur, archive: false },
        });
        intituleManquant = 'Convention non trouvee';
        break;
      case 'cotutelle_id':
        existant = await this.cotutelleRepo.findOne({
          where: { id: parent.valeur, archive: false },
        });
        intituleManquant = 'Cotutelle non trouvee';
        break;
      case 'partenariat_id':
        existant = await this.partenariatRepo.findOne({
          where: { id: parent.valeur, archive: false },
        });
        intituleManquant = 'Partenariat non trouve';
        break;
    }

    if (!existant) {
      throw new NotFoundException(intituleManquant);
    }
  }

  /**
   * Conserve le nom et l'extension fournis tout en empêchant qu'un chemin ou
   * des caractères de contrôle n'atteignent l'en-tête Content-Disposition.
   */
  private nettoyerNomFichier(valeur: string): string {
    const nom = [...basename(valeur.replace(/\\/g, '/'))]
      .filter((caractere) => {
        const code = caractere.codePointAt(0) ?? 0;
        return code >= 32 && code !== 127;
      })
      .join('')
      .trim();
    if (!nom) return 'document';

    const extensionComplete = extname(nom);
    const extension = extensionComplete.slice(0, 32);
    const racine = basename(nom, extensionComplete).trim() || 'document';
    return `${racine.slice(0, 255 - extension.length)}${extension}`;
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
      cotutelle_id: document.cotutelle_id,
      partenariat_id: document.partenariat_id,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }
}
