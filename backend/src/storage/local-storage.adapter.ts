import { Injectable, Logger } from '@nestjs/common';
import { StoragePort, FichierStocke } from './storage.port';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly baseDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async enregistrer(fichier: Express.Multer.File, dossier: string): Promise<string> {
    const dossierComplet = path.join(this.baseDir, dossier);
    if (!fs.existsSync(dossierComplet)) {
      fs.mkdirSync(dossierComplet, { recursive: true });
    }

    const extension = path.extname(fichier.originalname);
    const nomUnique = `${uuidv4()}${extension}`;
    const cheminComplet = path.join(dossierComplet, nomUnique);

    fs.writeFileSync(cheminComplet, fichier.buffer);

    return `/uploads/${dossier}/${nomUnique}`;
  }

  async supprimer(urlFichier: string): Promise<void> {
    const cheminComplet = path.join(this.baseDir, urlFichier.replace('/uploads/', ''));
    if (fs.existsSync(cheminComplet)) {
      fs.unlinkSync(cheminComplet);
    }
  }

  async listerFichiers(): Promise<FichierStocke[]> {
    const resultats: FichierStocke[] = [];
    if (!fs.existsSync(this.baseDir)) {
      return resultats;
    }
    this.parcourirDossier(this.baseDir, resultats);
    return resultats;
  }

  private parcourirDossier(dossierCourant: string, resultats: FichierStocke[]): void {
    let entrees: fs.Dirent[];
    try {
      entrees = fs.readdirSync(dossierCourant, { withFileTypes: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Impossible de lire ${dossierCourant} : ${message}`);
      return;
    }

    for (const entree of entrees) {
      const cheminComplet = path.join(dossierCourant, entree.name);

      if (entree.isDirectory()) {
        this.parcourirDossier(cheminComplet, resultats);
        continue;
      }

      if (!entree.isFile()) continue;

      try {
        const stats = fs.statSync(cheminComplet);
        const urlRelative = '/' + path.relative(process.cwd(), cheminComplet).replace(/\\/g, '/');
        resultats.push({
          url: urlRelative,
          cheminComplet,
          taille: stats.size,
          date_modification: stats.mtime,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Impossible de stat ${cheminComplet} : ${message}`);
      }
    }
  }
}